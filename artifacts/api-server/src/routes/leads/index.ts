import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

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

  res.json({ ...conv, messages: msgs });
});

// POST /leads/:id/complete — mark conversation as complete
router.post("/leads/:id/complete", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.update(conversations).set({ completed: true }).where(eq(conversations.id, id));

  logger.info({ conversationId: id }, "Lead marked as complete");

  res.json({ success: true, message: "Rozmowa została zakończona i zapisana jako lead" });
});

// POST /leads/upload — file attachment placeholder
router.post("/leads/upload", async (req, res): Promise<void> => {
  res.json({ success: true, message: "Plik otrzymany" });
});

export default router;
