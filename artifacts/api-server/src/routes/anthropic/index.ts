import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, conversations, messages, personas, personaTypes } from "@workspace/db";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { getSetting } from "../../lib/settings";
import {
  CreateAnthropicConversationBody,
  GetAnthropicConversationParams,
  DeleteAnthropicConversationParams,
  ListAnthropicMessagesParams,
  SendAnthropicMessageParams,
  SendAnthropicMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/anthropic/conversations", async (_req, res): Promise<void> => {
  const all = await db.select().from(conversations).orderBy(conversations.createdAt);
  res.json(all);
});

router.post("/anthropic/conversations", async (req, res): Promise<void> => {
  const parsed = CreateAnthropicConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const personaId = typeof parsed.data.personaId === "number" ? parsed.data.personaId : null;

  const [conv] = await db.insert(conversations).values({
    title: parsed.data.title,
    sessionToken: parsed.data.sessionToken,
    personaId,
  }).returning();

  res.status(201).json(conv);
});

router.get("/anthropic/conversations/:id", async (req, res): Promise<void> => {
  const params = GetAnthropicConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const id = parseInt(req.params.id, 10);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) { res.status(404).json({ error: "Conversation not found" }); return; }

  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json({ ...conv, messages: msgs });
});

router.delete("/anthropic/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteAnthropicConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const id = parseInt(req.params.id, 10);
  const [deleted] = await db.delete(conversations).where(eq(conversations.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Conversation not found" }); return; }
  res.sendStatus(204);
});

router.get("/anthropic/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = ListAnthropicMessagesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const id = parseInt(req.params.id, 10);
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json(msgs);
});

router.post("/anthropic/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = SendAnthropicMessageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const body = SendAnthropicMessageBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const convId = parseInt(req.params.id, 10);
  const userContent = body.data.content;
  if (!userContent || typeof userContent !== "string") {
    res.status(400).json({ error: "content is required" });
    return;
  }

  // Get conversation to find its associated persona
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId));

  await db.insert(messages).values({ conversationId: convId, role: "user", content: userContent });

  const history = await db.select().from(messages).where(eq(messages.conversationId, convId)).orderBy(messages.createdAt);
  const chatMessages = history.map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Build system prompt: personaType.systemPrompt + persona.additionalPrompt
  let systemPrompt = await getSetting("system_prompt");

  const personaId = conv?.personaId;
  if (personaId) {
    const [persona] = await db.select().from(personas).where(eq(personas.id, personaId));
    if (persona) {
      let basePrompt = persona.additionalPrompt || "";
      if (persona.personaTypeId) {
        const [pt] = await db.select().from(personaTypes).where(eq(personaTypes.id, persona.personaTypeId));
        if (pt && pt.systemPrompt) {
          basePrompt = pt.systemPrompt;
          if (persona.additionalPrompt) {
            basePrompt += `\n\n---\n\nDODATKOWE WYTYCZNE DLA TEJ KONKRETNEJ PERSONY:\n${persona.additionalPrompt}`;
          }
        }
      }
      if (basePrompt) systemPrompt = basePrompt;
    }
  } else {
    // Fallback: check active persona
    const [activePersona] = await db.select().from(personas).where(eq(personas.isActive, true));
    if (activePersona) {
      let basePrompt = activePersona.additionalPrompt || "";
      if (activePersona.personaTypeId) {
        const [pt] = await db.select().from(personaTypes).where(eq(personaTypes.id, activePersona.personaTypeId));
        if (pt && pt.systemPrompt) {
          basePrompt = pt.systemPrompt;
          if (activePersona.additionalPrompt) {
            basePrompt += `\n\n---\n\nDODATKOWE WYTYCZNE DLA TEJ KONKRETNEJ PERSONY:\n${activePersona.additionalPrompt}`;
          }
        }
      }
      if (basePrompt) systemPrompt = basePrompt;
    }
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  let fullResponse = "";

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: systemPrompt,
    messages: chatMessages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      fullResponse += event.delta.text;
      res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
    }
  }

  await db.insert(messages).values({ conversationId: convId, role: "assistant", content: fullResponse });
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
