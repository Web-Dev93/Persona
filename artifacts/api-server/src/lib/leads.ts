import { eq } from "drizzle-orm";
import { db, conversations, messages, personas, personaTypes } from "@workspace/db";
import { analyzeConversation, type LeadIntelligence } from "./lead-intelligence";
import type { LeadNotificationPayload } from "./notifications";
import { openrouter, openRouterModel } from "@workspace/integrations-anthropic-ai";
import { logger } from "./logger";

export type ConversationRow = typeof conversations.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;

export function buildTranscript(msgs: MessageRow[]): string {
  return msgs.map(m => `${m.role === "user" ? "Klient" : "Konsultant"}: ${m.content}`).join("\n\n");
}

export function contactInfoOf(conv: ConversationRow) {
  return {
    name: conv.contactName ?? null,
    email: conv.contactEmail ?? null,
    phone: conv.contactPhone ?? null,
    company: conv.contactCompany ?? null,
  };
}

export async function personaLabels(personaId: number | null): Promise<{
  personaName: string | null;
  personaTypeName: string | null;
}> {
  if (!personaId) return { personaName: null, personaTypeName: null };
  const [p] = await db.select().from(personas).where(eq(personas.id, personaId));
  if (!p) return { personaName: null, personaTypeName: null };
  let personaTypeName: string | null = null;
  if (p.personaTypeId) {
    const [pt] = await db.select().from(personaTypes).where(eq(personaTypes.id, p.personaTypeId));
    personaTypeName = pt?.name ?? null;
  }
  return { personaName: p.name, personaTypeName };
}

const SUMMARY_PROMPT_HEADER = `Na podstawie poniższej rozmowy z potencjalnym klientem, przygotuj zwięzłe, profesjonalne podsumowanie leada.

Podsumowanie powinno zawierać:
1. **Profil** — czym się zajmuje, kim jest klient
2. **Problem / Potrzeba** — co konkretnie chce zrealizować
3. **Szczegóły** — kluczowe wymagania, preferencje, informacje
4. **Dane kontaktowe** — jeśli klient je podał
5. **Ocena gotowości** — Wysoka / Średnia / Niska

Pisz po polsku, profesjonalnie i zwięźle.

TRANSKRYPCJA:
`;

export async function generateSummary(transcript: string): Promise<string> {
  try {
    const response = await openrouter.chat.completions.create({
      model: openRouterModel,
      max_tokens: 2048,
      messages: [{ role: "user", content: SUMMARY_PROMPT_HEADER + transcript }],
    });
    return response.choices[0]?.message?.content || "";
  } catch (err) {
    logger.error({ err }, "Lead summary generation failed");
    return "Nie udało się wygenerować automatycznego podsumowania.";
  }
}

/**
 * Runs summary + contact extraction for a conversation and persists both.
 * Returns the refreshed row.
 */
export async function enrichConversation(
  id: number,
  opts: { regenerateSummary?: boolean } = {},
): Promise<{ conv: ConversationRow; msgs: MessageRow[]; intelligence: LeadIntelligence } | null> {
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) return null;

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  const transcript = buildTranscript(msgs);
  const userMessages = msgs.filter(m => m.role === "user").map(m => m.content);

  const [intelligence, summary] = await Promise.all([
    analyzeConversation(transcript, userMessages),
    opts.regenerateSummary || !conv.summary ? generateSummary(transcript) : Promise.resolve(conv.summary),
  ]);

  await db
    .update(conversations)
    .set({
      summary: summary || conv.summary,
      requirements: intelligence.requirements ?? conv.requirements,
      contactName: intelligence.name ?? conv.contactName,
      contactEmail: intelligence.email ?? conv.contactEmail,
      contactPhone: intelligence.phone ?? conv.contactPhone,
      contactCompany: intelligence.company ?? conv.contactCompany,
    })
    .where(eq(conversations.id, id));

  const [refreshed] = await db.select().from(conversations).where(eq(conversations.id, id));
  return { conv: refreshed, msgs, intelligence };
}

export async function buildNotificationPayload(
  conv: ConversationRow,
  msgs: MessageRow[],
): Promise<LeadNotificationPayload> {
  const { personaName, personaTypeName } = await personaLabels(conv.personaId);
  return {
    conversationId: conv.id,
    title: conv.title,
    createdAt: conv.createdAt.toISOString(),
    personaName,
    personaTypeName,
    contact: contactInfoOf(conv),
    summary: conv.summary ?? null,
    requirements: conv.requirements ?? null,
    messageCount: msgs.length,
    transcript: buildTranscript(msgs),
  };
}
