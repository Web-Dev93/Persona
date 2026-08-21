import { logger } from "./logger";
import { getSetting } from "./settings";

export interface LeadNotificationPayload {
  conversationId: number;
  title: string;
  createdAt: string;
  personaName: string | null;
  personaTypeName: string | null;
  contact: {
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
  };
  summary: string | null;
  requirements: string | null;
  messageCount: number;
  transcript: string;
}

export interface DeliveryResult {
  emailSent: boolean;
  webhookSent: boolean;
  errors: string[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEmailHtml(payload: LeadNotificationPayload, companyName: string): string {
  const row = (label: string, value: string | null) =>
    value
      ? `<tr><td style="padding:6px 12px;font-weight:600;color:#334155;">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 12px;color:#0f172a;">${escapeHtml(value)}</td></tr>`
      : "";

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:640px;margin:0 auto;">
  <h2 style="color:#0f172a;margin-bottom:4px;">Nowy lead — ${escapeHtml(companyName)}</h2>
  <p style="color:#64748b;font-size:13px;margin-top:0;">Rozmowa #${payload.conversationId} · ${escapeHtml(payload.createdAt)}</p>

  <table style="border-collapse:collapse;width:100%;background:#f8fafc;border-radius:8px;margin:16px 0;">
    ${row("Imię i nazwisko", payload.contact.name)}
    ${row("E-mail", payload.contact.email)}
    ${row("Telefon", payload.contact.phone)}
    ${row("Firma", payload.contact.company)}
    ${row("Doradca", payload.personaName)}
    ${row("Typ persony", payload.personaTypeName)}
    ${row("Liczba wiadomości", String(payload.messageCount))}
  </table>

  ${payload.summary ? `<h3 style="color:#0f172a;">Podsumowanie AI</h3><p style="color:#334155;white-space:pre-wrap;">${escapeHtml(payload.summary)}</p>` : ""}
  ${payload.requirements ? `<h3 style="color:#0f172a;">Wymagania klienta</h3><p style="color:#334155;white-space:pre-wrap;">${escapeHtml(payload.requirements)}</p>` : ""}

  <h3 style="color:#0f172a;">Transkrypcja</h3>
  <pre style="white-space:pre-wrap;background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;font-size:12px;">${escapeHtml(payload.transcript)}</pre>
</div>`;
}

/** Returns true only when the message was actually handed to the mail provider. */
async function sendEmail(payload: LeadNotificationPayload, recipient: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const companyName = (await getSetting("company_name")) || process.env.COMPANY_NAME || "Persona";
  const from = process.env.LEAD_EMAIL_FROM || "onboarding@resend.dev";

  const subjectWho = payload.contact.name || payload.contact.company || `Sesja #${payload.conversationId}`;
  const subject = `[${companyName}] Nowy lead: ${subjectWho}`;

  if (!apiKey) {
    logger.info(
      { conversationId: payload.conversationId, recipient, subject },
      "RESEND_API_KEY not configured — lead e-mail logged instead of sent",
    );
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject,
      html: renderEmailHtml(payload, companyName),
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  }

  return true;
}

async function sendWebhook(payload: LeadNotificationPayload, url: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Persona-LeadCatcher/1.0" },
      body: JSON.stringify({ event: "lead.completed", data: payload }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Webhook responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fans a completed lead out to the configured channels. Never throws — a failing
 * integration must not fail the visitor-facing request that triggered it.
 */
export async function deliverLead(payload: LeadNotificationPayload): Promise<DeliveryResult> {
  const result: DeliveryResult = { emailSent: false, webhookSent: false, errors: [] };

  const recipient = (await getSetting("notification_email")) || process.env.LEAD_EMAIL || "";
  const webhookUrl = await getSetting("webhook_url");

  if (recipient) {
    try {
      result.emailSent = await sendEmail(payload, recipient);
    } catch (err: any) {
      logger.error({ err, conversationId: payload.conversationId }, "Lead e-mail delivery failed");
      result.errors.push(`E-mail: ${err?.message ?? "nieznany błąd"}`);
    }
  }

  if (webhookUrl) {
    try {
      await sendWebhook(payload, webhookUrl);
      result.webhookSent = true;
    } catch (err: any) {
      logger.error({ err, conversationId: payload.conversationId }, "Lead webhook delivery failed");
      result.errors.push(`Webhook: ${err?.message ?? "nieznany błąd"}`);
    }
  }

  return result;
}

export async function testWebhook(url: string): Promise<void> {
  await sendWebhook(
    {
      conversationId: 0,
      title: "Testowe zgłoszenie",
      createdAt: new Date().toISOString(),
      personaName: "Test",
      personaTypeName: null,
      contact: { name: "Jan Testowy", email: "test@example.com", phone: "500600700", company: "Testowa sp. z o.o." },
      summary: "To jest testowe powiadomienie wysłane z panelu administracyjnego.",
      requirements: "Weryfikacja integracji webhooka.",
      messageCount: 0,
      transcript: "Klient: test\n\nKonsultant: test",
    },
    url,
  );
}
