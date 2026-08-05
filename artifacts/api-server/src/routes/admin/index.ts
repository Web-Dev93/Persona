import { Router, type IRouter } from "express";
import { eq, sql, and, inArray } from "drizzle-orm";
import path from "path";
import fs from "fs";
import multer from "multer";
import { db, conversations, messages, personas, personaTypes } from "@workspace/db";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { getSetting, setSetting, getAllSettings } from "../../lib/settings";
import {
  GetAdminLeadParams,
  DeleteAdminLeadParams,
  SummarizeLeadParams,
  UpdateAdminSettingsBody,
  CreatePersonaBody,
  UpdatePersonaBody,
  CreatePersonaTypeBody,
  UpdatePersonaTypeBody,
  GetPersonaTypeParams,
  UpdatePersonaTypeParams,
  DeletePersonaTypeParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `persona-photo-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Helper: name → slug ──────────────────────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l").replace(/ą/g, "a").replace(/ę/g, "e")
    .replace(/ó/g, "o").replace(/ś/g, "s").replace(/ź/g, "z")
    .replace(/ż/g, "z").replace(/ć/g, "c").replace(/ń/g, "n")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Helper: compute effective style ────────────────────────────────────────
async function enrichPersona(persona: typeof personas.$inferSelect) {
  let personaTypeName: string | null = null;
  let effectiveStyle = persona.style ?? "professional";
  if (persona.personaTypeId) {
    const [pt] = await db.select().from(personaTypes).where(eq(personaTypes.id, persona.personaTypeId));
    if (pt) {
      personaTypeName = pt.name;
      effectiveStyle = persona.style ?? pt.defaultStyle;
    }
  }
  return { ...persona, personaTypeName, effectiveStyle };
}

// ─── Leads ───────────────────────────────────────────────────────────────────

router.get("/admin/leads", async (req, res): Promise<void> => {
  const personaIdFilter = req.query.personaId ? parseInt(req.query.personaId as string, 10) : null;
  const personaTypeIdFilter = req.query.personaTypeId ? parseInt(req.query.personaTypeId as string, 10) : null;

  // If filtering by persona type, first get persona IDs in that type
  let personaIdsForType: number[] | null = null;
  if (personaTypeIdFilter) {
    const ps = await db.select({ id: personas.id }).from(personas).where(eq(personas.personaTypeId, personaTypeIdFilter));
    personaIdsForType = ps.map(p => p.id);
  }

  let query = db
    .select({
      id: conversations.id,
      title: conversations.title,
      sessionToken: conversations.sessionToken,
      completed: conversations.completed,
      summary: conversations.summary,
      personaId: conversations.personaId,
      createdAt: conversations.createdAt,
      messageCount: sql<number>`cast(count(${messages.id}) as integer)`,
    })
    .from(conversations)
    .leftJoin(messages, eq(messages.conversationId, conversations.id))
    .groupBy(conversations.id)
    .orderBy(conversations.createdAt);

  const rows = await query;

  // Enrich with persona/type names
  const personaCache = new Map<number, { name: string; typeName: string | null }>();
  for (const row of rows) {
    if (row.personaId && !personaCache.has(row.personaId)) {
      const [p] = await db.select().from(personas).where(eq(personas.id, row.personaId));
      if (p) {
        let typeName: string | null = null;
        if (p.personaTypeId) {
          const [pt] = await db.select().from(personaTypes).where(eq(personaTypes.id, p.personaTypeId));
          typeName = pt?.name ?? null;
        }
        personaCache.set(row.personaId, { name: p.name, typeName });
      }
    }
  }

  const enriched = rows
    .map(row => ({
      ...row,
      personaName: row.personaId ? (personaCache.get(row.personaId)?.name ?? null) : null,
      personaTypeName: row.personaId ? (personaCache.get(row.personaId)?.typeName ?? null) : null,
    }))
    .filter(row => {
      if (personaIdFilter && row.personaId !== personaIdFilter) return false;
      if (personaIdsForType && (row.personaId === null || !personaIdsForType.includes(row.personaId))) return false;
      return true;
    });

  res.json(enriched);
});

router.get("/admin/leads/:id", async (req, res): Promise<void> => {
  const params = GetAdminLeadParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const id = parseInt(req.params.id, 10);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) { res.status(404).json({ error: "Lead not found" }); return; }

  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);

  let personaName: string | null = null;
  let personaTypeName: string | null = null;
  if (conv.personaId) {
    const [p] = await db.select().from(personas).where(eq(personas.id, conv.personaId));
    if (p) {
      personaName = p.name;
      if (p.personaTypeId) {
        const [pt] = await db.select().from(personaTypes).where(eq(personaTypes.id, p.personaTypeId));
        personaTypeName = pt?.name ?? null;
      }
    }
  }

  res.json({ ...conv, messageCount: msgs.length, messages: msgs, personaName, personaTypeName });
});

router.delete("/admin/leads/:id", async (req, res): Promise<void> => {
  const params = DeleteAdminLeadParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const id = parseInt(req.params.id, 10);
  const [deleted] = await db.delete(conversations).where(eq(conversations.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Lead not found" }); return; }
  res.sendStatus(204);
});

router.post("/admin/leads/:id/summarize", async (req, res): Promise<void> => {
  const params = SummarizeLeadParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const id = parseInt(req.params.id, 10);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) { res.status(404).json({ error: "Lead not found" }); return; }

  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  const transcript = msgs.map(m => `${m.role === "user" ? "Klient" : "Konsultant"}: ${m.content}`).join("\n\n");

  const summaryPrompt = `Na podstawie poniższej rozmowy z potencjalnym klientem, przygotuj zwięzłe, profesjonalne podsumowanie leada.

Podsumowanie powinno zawierać:
1. **Profil** — czym się zajmuje, kto jest klientem
2. **Problem / Potrzeba** — co konkretnie chce osiągnąć
3. **Szczegóły** — wymagania, preferencje, ważne informacje
4. **Dane kontaktowe** — jeśli klient je podał
5. **Ocena gotowości** — Wysoka / Średnia / Niska

Pisz po polsku, profesjonalnie i zwięźle.

TRANSKRYPCJA:
${transcript}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: summaryPrompt }],
  });

  const block = response.content[0];
  const summary = block.type === "text" ? block.text : "";
  await db.update(conversations).set({ summary }).where(eq(conversations.id, id));
  res.json({ summary });
});

// ─── Settings ────────────────────────────────────────────────────────────────

router.get("/admin/settings", async (_req, res): Promise<void> => {
  const settings = await getAllSettings();
  res.json({
    systemPrompt: settings["system_prompt"] ?? "",
    consultantName: settings["consultant_name"] ?? "Konsultant",
    consultantTitle: settings["consultant_title"] ?? "Specjalista ds. Strategii Cyfrowej",
    consultantPhotoUrl: settings["consultant_photo_url"] || null,
  });
});

router.put("/admin/settings", async (req, res): Promise<void> => {
  const parsed = UpdateAdminSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { systemPrompt, consultantName, consultantTitle, consultantPhotoUrl } = parsed.data;
  const updates: Array<Promise<void>> = [];
  if (systemPrompt !== undefined) updates.push(setSetting("system_prompt", systemPrompt));
  if (consultantName !== undefined) updates.push(setSetting("consultant_name", consultantName));
  if (consultantTitle !== undefined) updates.push(setSetting("consultant_title", consultantTitle));
  if (consultantPhotoUrl !== undefined) updates.push(setSetting("consultant_photo_url", consultantPhotoUrl ?? ""));
  await Promise.all(updates);

  const settings = await getAllSettings();
  res.json({
    systemPrompt: settings["system_prompt"] ?? "",
    consultantName: settings["consultant_name"] ?? "Konsultant",
    consultantTitle: settings["consultant_title"] ?? "Specjalista ds. Strategii Cyfrowej",
    consultantPhotoUrl: settings["consultant_photo_url"] || null,
  });
});

router.post("/admin/photo-upload", upload.single("photo"), async (req, res): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const basePath = process.env.BASE_PATH ?? "/api";
  const photoUrl = `${basePath}/static/uploads/${req.file.filename}`;
  await setSetting("consultant_photo_url", photoUrl);
  res.json({ photoUrl });
});

router.post("/admin/persona-photo-upload", upload.single("photo"), async (req, res): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const basePath = process.env.BASE_PATH ?? "/api";
  const photoUrl = `${basePath}/static/uploads/${req.file.filename}`;
  res.json({ photoUrl });
});

// ─── Public: persona by slug ─────────────────────────────────────────────────

router.get("/personas/by-slug/:slug", async (req, res): Promise<void> => {
  const slug = req.params.slug;
  if (!slug) { res.status(400).json({ error: "slug required" }); return; }

  const [persona] = await db.select().from(personas).where(eq(personas.slug, slug));
  if (!persona) { res.status(404).json({ error: "Persona not found" }); return; }

  const enriched = await enrichPersona(persona);
  res.json(enriched);
});

// ─── Persona Types ────────────────────────────────────────────────────────────

router.get("/admin/persona-types", async (_req, res): Promise<void> => {
  const types = await db.select().from(personaTypes).orderBy(personaTypes.createdAt);
  const allPersonas = await db.select().from(personas).orderBy(personas.createdAt);

  const result = types.map(pt => ({
    ...pt,
    personas: allPersonas
      .filter(p => p.personaTypeId === pt.id)
      .map(p => ({
        ...p,
        personaTypeName: pt.name,
        effectiveStyle: p.style ?? pt.defaultStyle,
      })),
  }));

  res.json(result);
});

router.post("/admin/persona-types", async (req, res): Promise<void> => {
  const parsed = CreatePersonaTypeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { name, slug, description, systemPrompt, defaultStyle, color } = parsed.data;
  const [pt] = await db.insert(personaTypes).values({
    name, slug: slug ?? name.toLowerCase().replace(/\s+/g, "-"),
    description: description ?? "", systemPrompt, defaultStyle, color,
  }).returning();

  res.status(201).json(pt);
});

router.get("/admin/persona-types/:id", async (req, res): Promise<void> => {
  const params = GetPersonaTypeParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const id = parseInt(req.params.id, 10);
  const [pt] = await db.select().from(personaTypes).where(eq(personaTypes.id, id));
  if (!pt) { res.status(404).json({ error: "Persona type not found" }); return; }
  res.json(pt);
});

router.put("/admin/persona-types/:id", async (req, res): Promise<void> => {
  const params = UpdatePersonaTypeParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const id = parseInt(req.params.id, 10);
  const parsed = UpdatePersonaTypeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { name, slug, description, systemPrompt, defaultStyle, color } = parsed.data;
  const [updated] = await db.update(personaTypes)
    .set({ name, slug: slug ?? name.toLowerCase().replace(/\s+/g, "-"), description: description ?? "", systemPrompt, defaultStyle, color })
    .where(eq(personaTypes.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Persona type not found" }); return; }
  res.json(updated);
});

router.delete("/admin/persona-types/:id", async (req, res): Promise<void> => {
  const params = DeletePersonaTypeParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const id = parseInt(req.params.id, 10);
  // Cascade: deactivate and nullify personaTypeId for personas of this type
  await db.update(personas).set({ personaTypeId: null, isActive: false }).where(eq(personas.personaTypeId, id));
  const [deleted] = await db.delete(personaTypes).where(eq(personaTypes.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Persona type not found" }); return; }
  res.sendStatus(204);
});

// ─── Personas ─────────────────────────────────────────────────────────────────

router.get("/admin/personas", async (_req, res): Promise<void> => {
  const all = await db.select().from(personas).orderBy(personas.createdAt);
  const enriched = await Promise.all(all.map(enrichPersona));
  res.json(enriched);
});

// IMPORTANT: /active before /:id
router.get("/admin/personas/active", async (_req, res): Promise<void> => {
  const [active] = await db.select().from(personas).where(eq(personas.isActive, true));
  if (!active) { res.status(404).json({ error: "No active persona" }); return; }
  const enriched = await enrichPersona(active);
  res.json(enriched);
});

router.post("/admin/personas", async (req, res): Promise<void> => {
  const parsed = CreatePersonaBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { personaTypeId, name, title, photoUrl, additionalPrompt, style } = parsed.data;
  const baseSlug = toSlug(name);
  // ensure uniqueness by appending suffix if needed
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const [existing] = await db.select({ id: personas.id }).from(personas).where(eq(personas.slug, slug));
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
  const [persona] = await db.insert(personas).values({
    personaTypeId: personaTypeId ?? null,
    name, title: title ?? "",
    photoUrl: photoUrl ?? null,
    additionalPrompt: additionalPrompt ?? "",
    slug,
    style: style ?? null,
  }).returning();

  const enriched = await enrichPersona(persona);
  res.status(201).json(enriched);
});

router.get("/admin/personas/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [persona] = await db.select().from(personas).where(eq(personas.id, id));
  if (!persona) { res.status(404).json({ error: "Persona not found" }); return; }

  const enriched = await enrichPersona(persona);
  res.json(enriched);
});

router.put("/admin/personas/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = UpdatePersonaBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { personaTypeId, name, title, photoUrl, additionalPrompt, style } = parsed.data;
  const [updated] = await db.update(personas)
    .set({
      personaTypeId: personaTypeId ?? null,
      name, title: title ?? "",
      photoUrl: photoUrl ?? null,
      additionalPrompt: additionalPrompt ?? "",
      style: style ?? null,
    })
    .where(eq(personas.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Persona not found" }); return; }
  const enriched = await enrichPersona(updated);
  res.json(enriched);
});

router.delete("/admin/personas/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [deleted] = await db.delete(personas).where(eq(personas.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Persona not found" }); return; }
  res.sendStatus(204);
});

router.post("/admin/personas/:id/activate", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.update(personas).set({ isActive: false });
  const [activated] = await db.update(personas).set({ isActive: true }).where(eq(personas.id, id)).returning();
  if (!activated) { res.status(404).json({ error: "Persona not found" }); return; }

  const enriched = await enrichPersona(activated);
  res.json(enriched);
});

export default router;
