import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import path from "path";
import fs from "fs";
import { ensureUploadDir } from "../../lib/paths";
import multer from "multer";
import { db, conversations, messages, personas, personaTypes, attachments } from "@workspace/db";
import { openrouter, openRouterModel } from "@workspace/integrations-anthropic-ai";
import { getSetting, setSetting, getAllSettings } from "../../lib/settings";
import { buildNotificationPayload, contactInfoOf, enrichConversation } from "../../lib/leads";
import { deliverLead, testWebhook } from "../../lib/notifications";
import { extractContactInfo } from "../../lib/lead-intelligence";
import {
  GetAdminLeadParams,
  DeleteAdminLeadParams,
  SummarizeLeadParams,
  UpdateAdminSettingsBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const UPLOAD_DIR = ensureUploadDir();

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

  let personaIdsForType: number[] | null = null;
  if (personaTypeIdFilter) {
    const ps = await db.select({ id: personas.id }).from(personas).where(eq(personas.personaTypeId, personaTypeIdFilter));
    personaIdsForType = ps.map(p => p.id);
  }

  const query = db
    .select({
      id: conversations.id,
      title: conversations.title,
      sessionToken: conversations.sessionToken,
      completed: conversations.completed,
      summary: conversations.summary,
      requirements: conversations.requirements,
      contactName: conversations.contactName,
      contactEmail: conversations.contactEmail,
      contactPhone: conversations.contactPhone,
      contactCompany: conversations.contactCompany,
      emailSent: conversations.emailSent,
      webhookSent: conversations.webhookSent,
      personaId: conversations.personaId,
      createdAt: conversations.createdAt,
      messageCount: sql<number>`cast(count(${messages.id}) as integer)`,
    })
    .from(conversations)
    .leftJoin(messages, eq(messages.conversationId, conversations.id))
    .groupBy(
      conversations.id,
      conversations.title,
      conversations.sessionToken,
      conversations.completed,
      conversations.summary,
      conversations.requirements,
      conversations.contactName,
      conversations.contactEmail,
      conversations.contactPhone,
      conversations.contactCompany,
      conversations.emailSent,
      conversations.webhookSent,
      conversations.personaId,
      conversations.createdAt
    )
    .orderBy(conversations.createdAt);

  const rows = await query;

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
      contactInfo: contactInfoOf(row as any),
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

  const attachmentRows = await db.select().from(attachments).where(eq(attachments.conversationId, id));

  res.json({
    ...conv,
    contactInfo: contactInfoOf(conv),
    messageCount: msgs.length,
    messages: msgs,
    attachments: attachmentRows,
    personaName,
    personaTypeName,
  });
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
  const enriched = await enrichConversation(id, { regenerateSummary: true });
  if (!enriched) { res.status(404).json({ error: "Lead not found" }); return; }

  res.json({
    summary: enriched.conv.summary ?? "",
    requirements: enriched.conv.requirements ?? null,
    contactInfo: contactInfoOf(enriched.conv),
  });
});

// Re-send an already captured lead to the configured e-mail / webhook targets.
router.post("/admin/leads/:id/resend", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) { res.status(404).json({ error: "Lead not found" }); return; }

  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  const payload = await buildNotificationPayload(conv, msgs);
  const delivery = await deliverLead(payload);

  await db
    .update(conversations)
    .set({
      emailSent: conv.emailSent || delivery.emailSent,
      webhookSent: conv.webhookSent || delivery.webhookSent,
    })
    .where(eq(conversations.id, id));

  res.json({
    success: delivery.errors.length === 0,
    emailSent: delivery.emailSent,
    webhookSent: delivery.webhookSent,
    errors: delivery.errors,
  });
});

function settingsResponse(settings: Record<string, string>) {
  return {
    systemPrompt: settings["system_prompt"] ?? "",
    consultantName: settings["consultant_name"] ?? "Konsultant",
    consultantTitle: settings["consultant_title"] ?? "Specjalista ds. Strategii Cyfrowej",
    consultantPhotoUrl: settings["consultant_photo_url"] || null,
    companyName: settings["company_name"] || "Persona",
    notificationEmail: settings["notification_email"] || "",
    webhookUrl: settings["webhook_url"] || "",
    salesEnabled: settings["sales_enabled"] === "true",
    timerMode: settings["timer_mode"] || "disabled",
    timerHours: parseInt(settings["timer_hours"] || "24", 10) || 24,
  };
}

// ─── Settings ────────────────────────────────────────────────────────────────

router.get("/admin/settings", async (_req, res): Promise<void> => {
  res.json(settingsResponse(await getAllSettings()));
});

// Lightweight public settings for clients / demo simulator
router.get("/public/settings", async (_req, res): Promise<void> => {
  const settings = await getAllSettings();
  res.json({
    salesEnabled: settings["sales_enabled"] === "true",
    timerMode: settings["timer_mode"] || "disabled",
    timerHours: parseInt(settings["timer_hours"] || "24", 10) || 24,
    consultantName: settings["consultant_name"] ?? "Konsultant",
    companyName: settings["company_name"] || "Persona",
  });
});

router.put("/admin/settings", async (req, res): Promise<void> => {
  const parsed = UpdateAdminSettingsBody.safeParse(req.body ?? {});
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const {
    systemPrompt,
    consultantName,
    consultantTitle,
    consultantPhotoUrl,
    companyName,
    notificationEmail,
    webhookUrl,
    salesEnabled,
    timerMode,
    timerHours,
  } = parsed.data;

  const updates: Array<Promise<void>> = [];
  if (systemPrompt !== undefined) updates.push(setSetting("system_prompt", String(systemPrompt)));
  if (consultantName !== undefined) updates.push(setSetting("consultant_name", String(consultantName)));
  if (consultantTitle !== undefined) updates.push(setSetting("consultant_title", String(consultantTitle)));
  if (consultantPhotoUrl !== undefined) updates.push(setSetting("consultant_photo_url", consultantPhotoUrl ? String(consultantPhotoUrl) : ""));
  if (companyName !== undefined) updates.push(setSetting("company_name", String(companyName)));
  if (notificationEmail !== undefined) updates.push(setSetting("notification_email", notificationEmail ? String(notificationEmail) : ""));
  if (webhookUrl !== undefined) updates.push(setSetting("webhook_url", webhookUrl ? String(webhookUrl) : ""));
  if (salesEnabled !== undefined) updates.push(setSetting("sales_enabled", salesEnabled ? "true" : "false"));
  if (timerMode !== undefined) updates.push(setSetting("timer_mode", String(timerMode)));
  if (timerHours !== undefined) updates.push(setSetting("timer_hours", String(timerHours)));
  await Promise.all(updates);

  res.json(settingsResponse(await getAllSettings()));
});

// Fire a sample payload at the configured (or supplied) webhook so the operator
// can verify the CRM integration without waiting for a real lead.
router.post("/admin/webhook-test", async (req, res): Promise<void> => {
  const supplied = typeof (req.body as any)?.webhookUrl === "string" ? (req.body as any).webhookUrl.trim() : "";
  const url = supplied || (await getSetting("webhook_url"));
  if (!url) { res.status(400).json({ error: "Brak skonfigurowanego adresu webhooka" }); return; }

  try {
    await testWebhook(url);
    res.json({ success: true, message: "Testowe zgłoszenie zostało wysłane" });
  } catch (err: any) {
    res.status(502).json({ error: err?.message ?? "Webhook nie odpowiedział poprawnie" });
  }
});

// ─── Analytics & Conversation Intelligence ────────────────────────────────────

router.get("/admin/analytics/overview", async (_req, res): Promise<void> => {
  const allConversations = await db.select().from(conversations).orderBy(conversations.createdAt);
  const allMessages = await db.select().from(messages).orderBy(messages.createdAt);

  const userMessages = allMessages.filter(m => m.role === "user");
  const assistantMessages = allMessages.filter(m => m.role === "assistant");

  // Contact detection reuses the shared extractor so analytics agrees with what
  // the CRM stored, and so digit runs in URLs or timestamps are not read as phones.
  const capturedContacts: Array<{ type: "phone" | "email"; value: string; conversationId: number; date: string }> = [];
  const intentCounts: Record<string, number> = {
    pricing: 0,
    timeline: 0,
    technical: 0,
    appointment: 0,
    general: 0,
  };

  const topicKeywords: Record<string, number> = {};

  userMessages.forEach(m => {
    const text = m.content.toLowerCase();

    const detected = extractContactInfo([m.content]);
    if (detected.phone) {
      capturedContacts.push({ type: "phone", value: detected.phone, conversationId: m.conversationId, date: m.createdAt.toISOString() });
    }
    if (detected.email) {
      capturedContacts.push({ type: "email", value: detected.email, conversationId: m.conversationId, date: m.createdAt.toISOString() });
    }

    // Intent classifier
    if (text.includes("cen") || text.includes("koszt") || text.includes("ile") || text.includes("zł") || text.includes("budżet") || text.includes("wycen")) {
      intentCounts.pricing++;
    } else if (text.includes("termin") || text.includes("kiedy") || text.includes("czas") || text.includes("szybko") || text.includes("dni")) {
      intentCounts.timeline++;
    } else if (text.includes("jak") || text.includes("funkcj") || text.includes("technol") || text.includes("stron") || text.includes("integrac") || text.includes("materiał")) {
      intentCounts.technical++;
    } else if (text.includes("spotka") || text.includes("pomiar") || text.includes("kontakt") || text.includes("zadzwon") || text.includes("konsultac")) {
      intentCounts.appointment++;
    } else {
      intentCounts.general++;
    }

    // Frequent words
    const words = text.replace(/[^a-ząćęłńóśźż0-9\s]/gi, "").split(/\s+/).filter(w => w.length > 3);
    words.forEach(w => {
      topicKeywords[w] = (topicKeywords[w] || 0) + 1;
    });
  });

  const sortedKeywords = Object.entries(topicKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([keyword, count]) => ({ keyword, count }));

  // Conversation breakdown with message samples
  const convDetails = allConversations.map(c => {
    const convMsgs = allMessages.filter(m => m.conversationId === c.id);
    const userMsgs = convMsgs.filter(m => m.role === "user");
    const convContact = extractContactInfo(userMsgs.map(m => m.content));
    const hasPhone = convContact.phone !== null;
    const hasEmail = convContact.email !== null;

    return {
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      messageCount: convMsgs.length,
      userMessageCount: userMsgs.length,
      hasLeadContact: hasPhone || hasEmail,
      summary: c.summary,
      lastMessage: convMsgs[convMsgs.length - 1]?.content || "",
    };
  });

  res.json({
    totalConversations: allConversations.length,
    totalUserMessages: userMessages.length,
    totalAssistantMessages: assistantMessages.length,
    capturedContactsCount: capturedContacts.length,
    capturedContacts,
    intentCounts,
    topKeywords: sortedKeywords,
    conversations: convDetails,
  });
});

router.post("/admin/analytics/ai-report", async (_req, res): Promise<void> => {
  const allMessages = await db.select().from(messages).orderBy(messages.createdAt);
  const userMessages = allMessages.filter(m => m.role === "user");

  if (userMessages.length === 0) {
    res.json({
      report: "Brak wystarczającej liczby wiadomości od klientów do wygenerowania raportu. Rozpocznij testy w symulatorze lub udostępnij widget.",
      generatedAt: new Date().toISOString(),
    });
    return;
  }

  const sampleTexts = userMessages.slice(-30).map((m, i) => `${i + 1}. ${m.content}`).join("\n");

  const prompt = `Jesteś ekspertem analityki konwersacyjnej i Lead Intelligence.
Poniżej znajduje się zestaw autentycznych wiadomości wpisanych przez potencjalnych klientów do doradcy:

${sampleTexts}

Przygotuj profesjonalną, zwięzłą i konkretną analizę zachowań użytkowników w punktach:
1. 🎯 **Główne intencje i potrzeby klientów** (O co najczęściej pytają? Czego szukają?)
2. 💡 **Bariery i obiekcje** (Co budzi ich wątpliwości lub wahanie?)
3. 📈 **Skuteczność pozyskiwania kontaktu** (W jakich momentach użytkownicy chętnie podają dane?)
4. 🚀 **Rekomendacje optymalizacji promptu** (Co poprawić w konfiguracji doradcy, aby podnieść konwersję?)

Pisz w języku polskim, zwięźle, konkretnie i zorientowane na biznes.`;

  try {
    const response = await openrouter.chat.completions.create({
      model: openRouterModel,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });
    const report = response.choices[0]?.message?.content || "Raport wygenerowany pomyślnie.";
    res.json({ report, generatedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: "Błąd podczas generowania analizy AI" });
  }
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
  const slug = req.params.slug?.toLowerCase().trim();
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
  const { name, slug, description, systemPrompt, defaultStyle, color } = req.body || {};
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "Nazwa typu jest wymagana" });
    return;
  }
  if (!systemPrompt || typeof systemPrompt !== "string") {
    res.status(400).json({ error: "System prompt jest wymagany" });
    return;
  }

  const baseSlug = (slug && typeof slug === "string" && slug.trim() ? toSlug(slug) : toSlug(name)) || "typ-persony";
  let uniqueSlug = baseSlug;
  let attempt = 0;
  while (true) {
    const [existing] = await db.select({ id: personaTypes.id }).from(personaTypes).where(eq(personaTypes.slug, uniqueSlug));
    if (!existing) break;
    attempt++;
    uniqueSlug = `${baseSlug}-${attempt}`;
  }

  const [pt] = await db.insert(personaTypes).values({
    name,
    slug: uniqueSlug,
    description: description || "",
    systemPrompt,
    defaultStyle: defaultStyle || "professional",
    color: color || "#4f46e5",
  }).returning();

  res.status(201).json(pt);
});

router.get("/admin/persona-types/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [pt] = await db.select().from(personaTypes).where(eq(personaTypes.id, id));
  if (!pt) { res.status(404).json({ error: "Persona type not found" }); return; }
  res.json(pt);
});

router.put("/admin/persona-types/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const { name, slug, description, systemPrompt, defaultStyle, color } = req.body || {};
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "Nazwa typu jest wymagana" });
    return;
  }

  const baseSlug = (slug && typeof slug === "string" && slug.trim() ? toSlug(slug) : toSlug(name)) || "typ-persony";

  const [updated] = await db.update(personaTypes)
    .set({
      name,
      slug: baseSlug,
      description: description || "",
      systemPrompt: systemPrompt || "",
      defaultStyle: defaultStyle || "professional",
      color: color || "#4f46e5",
    })
    .where(eq(personaTypes.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Persona type not found" }); return; }
  res.json(updated);
});

router.delete("/admin/persona-types/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

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

router.get("/admin/personas/active", async (_req, res): Promise<void> => {
  const [active] = await db.select().from(personas).where(eq(personas.isActive, true));
  if (!active) {
    // If none active, fallback to first persona (Ania)
    const [first] = await db.select().from(personas).orderBy(personas.createdAt);
    if (first) {
      await db.update(personas).set({ isActive: true }).where(eq(personas.id, first.id));
      const enriched = await enrichPersona({ ...first, isActive: true });
      res.json(enriched);
      return;
    }
    res.status(404).json({ error: "No active persona" });
    return;
  }
  const enriched = await enrichPersona(active);
  res.json(enriched);
});

router.post("/admin/personas", async (req, res): Promise<void> => {
  const { personaTypeId, name, title, photoUrl, additionalPrompt, style, slug } = req.body || {};
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "Imię persony jest wymagane" });
    return;
  }

  const baseSlug = (slug && typeof slug === "string" && slug.trim() ? toSlug(slug) : toSlug(name)) || "persona";
  let uniqueSlug = baseSlug;
  let attempt = 0;
  while (true) {
    const [existing] = await db.select({ id: personas.id }).from(personas).where(eq(personas.slug, uniqueSlug));
    if (!existing) break;
    attempt++;
    uniqueSlug = `${baseSlug}-${attempt}`;
  }

  const [persona] = await db.insert(personas).values({
    personaTypeId: personaTypeId ? Number(personaTypeId) : null,
    name,
    title: title || "",
    photoUrl: photoUrl || null,
    additionalPrompt: additionalPrompt || "",
    slug: uniqueSlug,
    style: style || null,
    isActive: false,
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

  const { personaTypeId, name, title, photoUrl, additionalPrompt, style, slug } = req.body || {};
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "Imię persony jest wymagane" });
    return;
  }

  const [existingPersona] = await db.select().from(personas).where(eq(personas.id, id));
  if (!existingPersona) { res.status(404).json({ error: "Persona not found" }); return; }

  let finalSlug = existingPersona.slug;
  if (slug && slug !== existingPersona.slug) {
    finalSlug = toSlug(slug);
  }

  const [updated] = await db.update(personas)
    .set({
      personaTypeId: personaTypeId ? Number(personaTypeId) : null,
      name,
      title: title || "",
      photoUrl: photoUrl ?? existingPersona.photoUrl,
      additionalPrompt: additionalPrompt || "",
      style: style || null,
      slug: finalSlug,
    })
    .where(eq(personas.id, id))
    .returning();

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
