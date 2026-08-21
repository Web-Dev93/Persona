import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import multer, { MulterError } from "multer";
import { db, conversations, messages, attachments } from "@workspace/db";
import { logger } from "../../lib/logger";
import { buildNotificationPayload, contactInfoOf, enrichConversation } from "../../lib/leads";
import { deliverLead } from "../../lib/notifications";

const router: IRouter = Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).slice(0, 12);
      cb(null, `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error(`Nieobsługiwany typ pliku: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

// GET /leads/session/:token — resume session by localStorage token
router.get("/leads/session/:token", async (req, res): Promise<void> => {
  const rawToken = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.sessionToken, rawToken));

  if (!conv) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conv.id))
    .orderBy(messages.createdAt);

  res.json({ ...conv, contactInfo: contactInfoOf(conv), messages: msgs });
});

// POST /leads/:id/complete — finish the conversation, summarize it and notify the owner
router.post("/leads/:id/complete", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  const enriched = await enrichConversation(id, { regenerateSummary: true });
  if (!enriched) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.update(conversations).set({ completed: true }).where(eq(conversations.id, id));

  const payload = await buildNotificationPayload({ ...enriched.conv, completed: true }, enriched.msgs);
  const delivery = await deliverLead(payload);

  await db
    .update(conversations)
    .set({ emailSent: delivery.emailSent, webhookSent: delivery.webhookSent })
    .where(eq(conversations.id, id));

  logger.info(
    { conversationId: id, emailSent: delivery.emailSent, webhookSent: delivery.webhookSent },
    "Lead completed and delivered",
  );

  res.json({
    success: true,
    message: "Rozmowa została zakończona i zapisana jako lead",
    emailSent: delivery.emailSent,
    webhookSent: delivery.webhookSent,
    summary: enriched.conv.summary ?? null,
    contactInfo: contactInfoOf(enriched.conv),
  });
});

// POST /leads/upload — attach a file to a conversation
router.post("/leads/upload", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "Brak pliku w żądaniu (pole 'file')" });
    return;
  }

  const rawConvId = (req.body as Record<string, unknown> | undefined)?.conversationId;
  const conversationId = rawConvId !== undefined ? parseInt(String(rawConvId), 10) : NaN;
  let linkedConversationId: number | null = null;

  if (!isNaN(conversationId)) {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    if (conv) linkedConversationId = conv.id;
  }

  const basePath = process.env.BASE_PATH ?? "/api";
  const fileUrl = `${basePath}/static/uploads/${req.file.filename}`;

  const [record] = await db
    .insert(attachments)
    .values({
      conversationId: linkedConversationId,
      fileName: req.file.originalname,
      fileUrl,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    })
    .returning();

  if (linkedConversationId) {
    await db.insert(messages).values({
      conversationId: linkedConversationId,
      role: "user",
      content: `[Załącznik] ${req.file.originalname} — ${fileUrl}`,
    });
  }

  logger.info({ attachmentId: record.id, conversationId: linkedConversationId }, "Lead attachment stored");

  res.status(201).json({
    success: true,
    message: "Plik został zapisany",
    id: record.id,
    fileName: record.fileName,
    fileUrl: record.fileUrl,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
  });
});

// Multer rejects oversized files and unsupported types by throwing; without this
// the visitor would get an opaque 500 instead of a usable message.
router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (!err) { next(); return; }
  const message = err instanceof Error ? err.message : "Nie udało się przetworzyć pliku";
  const status = err instanceof MulterError && err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
  logger.warn({ err }, "Lead upload rejected");
  res.status(status).json({ error: message });
});

// GET /leads/:id/attachments — files attached to a conversation
router.get("/leads/:id/attachments", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }
  const rows = await db.select().from(attachments).where(eq(attachments.conversationId, id));
  res.json(rows);
});

// POST /leads/:id/contact — persist contact details the visitor typed into a form
router.post("/leads/:id/contact", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length ? t : null;
  };

  await db
    .update(conversations)
    .set({
      contactName: str(body.name) ?? conv.contactName,
      contactEmail: str(body.email) ?? conv.contactEmail,
      contactPhone: str(body.phone) ?? conv.contactPhone,
      contactCompany: str(body.company) ?? conv.contactCompany,
    })
    .where(eq(conversations.id, id));

  const [updated] = await db.select().from(conversations).where(eq(conversations.id, id));
  res.json({ success: true, contactInfo: contactInfoOf(updated) });
});

export default router;
