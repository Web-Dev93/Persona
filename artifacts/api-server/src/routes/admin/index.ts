import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import path from "path";
import fs from "fs";
import multer from "multer";
import { db, conversations, messages } from "@workspace/db";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { getSetting, setSetting, getAllSettings } from "../../lib/settings";
import {
  GetAdminLeadParams,
  DeleteAdminLeadParams,
  SummarizeLeadParams,
  UpdateAdminSettingsBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Upload directory for consultant photos
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `consultant-photo-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /admin/leads — list all leads with message count
router.get("/admin/leads", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      sessionToken: conversations.sessionToken,
      completed: conversations.completed,
      summary: conversations.summary,
      createdAt: conversations.createdAt,
      messageCount: sql<number>`cast(count(${messages.id}) as integer)`,
    })
    .from(conversations)
    .leftJoin(messages, eq(messages.conversationId, conversations.id))
    .groupBy(conversations.id)
    .orderBy(conversations.createdAt);

  res.json(rows);
});

// GET /admin/leads/:id — lead detail with messages
router.get("/admin/leads/:id", async (req, res): Promise<void> => {
  const params = GetAdminLeadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  res.json({ ...conv, messageCount: msgs.length, messages: msgs });
});

// DELETE /admin/leads/:id
router.delete("/admin/leads/:id", async (req, res): Promise<void> => {
  const params = DeleteAdminLeadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [deleted] = await db.delete(conversations).where(eq(conversations.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.sendStatus(204);
});

// POST /admin/leads/:id/summarize — AI-generate a structured lead summary
router.post("/admin/leads/:id/summarize", async (req, res): Promise<void> => {
  const params = SummarizeLeadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  const transcript = msgs
    .map((m) => `${m.role === "user" ? "Klient" : "Konsultant"}: ${m.content}`)
    .join("\n\n");

  const summaryPrompt = `Na podstawie poniższej rozmowy z potencjalnym klientem, przygotuj zwięzłe, profesjonalne podsumowanie leada dla agencji webowej.

Podsumowanie powinno zawierać:
1. **Profil firmy** — czym się zajmuje, kto jest klientem
2. **Problem / Potrzeba** — co konkretnie klient chce osiągnąć
3. **Wymagania techniczne** — jakie funkcje, sekcje, integracje
4. **Inspiracje / Styl** — preferencje wizualne jeśli wspomniane
5. **Dane kontaktowe** — jeśli klient je podał
6. **Ocena gotowości** — jak bardzo klient jest zdecydowany (skala: Wysoka / Średnia / Niska)

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

// GET /admin/settings
router.get("/admin/settings", async (_req, res): Promise<void> => {
  const settings = await getAllSettings();
  res.json({
    systemPrompt: settings["system_prompt"] ?? "",
    consultantName: settings["consultant_name"] ?? "Konsultant",
    consultantTitle: settings["consultant_title"] ?? "Specjalista ds. Strategii Cyfrowej",
    consultantPhotoUrl: settings["consultant_photo_url"] || null,
  });
});

// PUT /admin/settings
router.put("/admin/settings", async (req, res): Promise<void> => {
  const parsed = UpdateAdminSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { systemPrompt, consultantName, consultantTitle, consultantPhotoUrl } = parsed.data;

  const updates: Array<Promise<void>> = [];
  if (systemPrompt !== undefined) updates.push(setSetting("system_prompt", systemPrompt));
  if (consultantName !== undefined) updates.push(setSetting("consultant_name", consultantName));
  if (consultantTitle !== undefined) updates.push(setSetting("consultant_title", consultantTitle));
  if (consultantPhotoUrl !== undefined) {
    updates.push(setSetting("consultant_photo_url", consultantPhotoUrl ?? ""));
  }

  await Promise.all(updates);

  const settings = await getAllSettings();
  res.json({
    systemPrompt: settings["system_prompt"] ?? "",
    consultantName: settings["consultant_name"] ?? "Konsultant",
    consultantTitle: settings["consultant_title"] ?? "Specjalista ds. Strategii Cyfrowej",
    consultantPhotoUrl: settings["consultant_photo_url"] || null,
  });
});

// POST /admin/photo-upload — upload consultant photo
router.post("/admin/photo-upload", upload.single("photo"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const basePath = process.env.BASE_PATH ?? "/api";
  const photoUrl = `${basePath}/static/uploads/${req.file.filename}`;
  await setSetting("consultant_photo_url", photoUrl);

  res.json({ photoUrl });
});

export default router;
