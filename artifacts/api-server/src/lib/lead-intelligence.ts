import { openrouter, openRouterModel } from "@workspace/integrations-anthropic-ai";
import { logger } from "./logger";

export interface ContactInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
}

export interface LeadIntelligence extends ContactInfo {
  requirements: string | null;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
// Polish mobile / landline formats, optional +48 prefix and separators.
// The \w boundaries stop a 9-digit window from being carved out of a longer run
// of digits — timestamps in filenames and URLs are not phone numbers.
const PHONE_RE =
  /(?<!\w)(?:\+?48[\s-]?)?(?:\d{3}[\s-]?\d{3}[\s-]?\d{3}|\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})(?!\w)/;

// Diacritics are frequently dropped when people type quickly, so both spellings match.
const NAME_PATTERNS: RegExp[] = [
  /(?:nazywam si[eę]|mam na imi[eę]|jestem)\s+([A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]+)?)/iu,
  /(?:z tej strony|tu)\s+([A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]+)?)/iu,
];

/** A capture only counts as a personal name if it is actually capitalised. */
function looksLikeName(value: string): boolean {
  return /^[A-ZĄĆĘŁŃÓŚŹŻ]/u.test(value);
}

// Bounded to at most four tokens so a company name never swallows the rest of
// the sentence; sentence splitting below provides the outer bound.
// Up to three tokens plus an optional Polish legal form (sp. z o.o., S.A., sp. j.).
const LEGAL_SUFFIX = String.raw`(?:\s+(?:sp\.?\s*z\s*o\.?\s*o\.?|s\.?\s*a\.?|sp\.?\s*j\.?|sp\.?\s*k\.?))?`;
// The negative lookahead stops a bare "sp" / "z" / "o.o." from being eaten as a
// normal word, so the legal-form suffix below can capture it intact.
const NOT_LEGAL_FORM = String.raw`(?!(?:sp|s|z|o)\b)`;
const COMPANY_TOKENS =
  String.raw`[\p{L}0-9&][\p{L}0-9&\-]*(?:\s+${NOT_LEGAL_FORM}[\p{L}0-9&\-]+){0,2}` + LEGAL_SUFFIX;
const COMPANY_PATTERNS: RegExp[] = [
  new RegExp(String.raw`(?:firma|firmy|firm[ęe])\s+(?:o nazwie\s+)?["„]?(${COMPANY_TOKENS})["”]?`, "iu"),
  new RegExp(
    String.raw`(?:prowadz[ęe]|reprezentuj[ęe]|pracuj[ęe] w)\s+(?:firm[ęea]|spółk[ęea]|spolk[ęea])?\s*["„]?(${COMPANY_TOKENS})["”]?`,
    "iu",
  ),
];

/** Splits on sentence boundaries so a pattern cannot reach past the clause it matched. */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ0-9])|\n+/)
    .map(part => part.trim())
    .filter(Boolean);
}

function firstMatch(texts: string[], re: RegExp): string | null {
  for (const text of texts) {
    for (const sentence of sentences(text)) {
      const m = sentence.match(re);
      if (m) {
        const value = (m[1] ?? m[0]).trim().replace(/[.,;:]+$/, "");
        if (value) return value;
      }
    }
  }
  return null;
}

function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  // Reject things that are obviously not phone numbers (years, prices, areas).
  const bare = digits.replace(/^\+?48/, "");
  if (bare.length !== 9) return null;
  return digits.startsWith("+") ? digits : bare;
}

/**
 * Best-effort contact extraction from the raw user turns of a conversation.
 * Deterministic (regex only) so it can run on every message without cost.
 */
export function extractContactInfo(userMessages: string[]): ContactInfo {
  const email = firstMatch(userMessages, EMAIL_RE);

  let phone: string | null = null;
  for (const t of userMessages) {
    // Drop e-mails first so their digits are never read as a phone number.
    const withoutEmails = t.replace(new RegExp(EMAIL_RE.source, "g"), " ");
    const candidate = withoutEmails.match(PHONE_RE)?.[0] ?? null;
    phone = normalizePhone(candidate);
    if (phone) break;
  }

  let name: string | null = null;
  for (const re of NAME_PATTERNS) {
    const candidate = firstMatch(userMessages, re);
    if (candidate && looksLikeName(candidate)) {
      name = candidate;
      break;
    }
  }

  let company: string | null = null;
  for (const re of COMPANY_PATTERNS) {
    company = firstMatch(userMessages, re);
    if (company) break;
  }

  return { name, email, phone, company };
}

/**
 * Asks the model for a structured read of the conversation and merges it with the
 * regex result. Regex wins for e-mail/phone (it cannot hallucinate them);
 * the model fills in name, company and the requirements digest.
 */
export async function analyzeConversation(
  transcript: string,
  userMessages: string[],
): Promise<LeadIntelligence> {
  const regexInfo = extractContactInfo(userMessages);

  const prompt = `Przeanalizuj poniższą transkrypcję rozmowy handlowej i zwróć WYŁĄCZNIE obiekt JSON — bez komentarzy, bez bloków kodu.

Format:
{
  "name": "imię i nazwisko klienta lub null",
  "email": "adres e-mail lub null",
  "phone": "numer telefonu lub null",
  "company": "nazwa firmy klienta lub null",
  "requirements": "zwięzłe streszczenie potrzeb i wymagań klienta (2-4 zdania) lub null"
}

Jeżeli jakiejś informacji nie ma w rozmowie, wpisz null. Nie zgaduj i nie wymyślaj danych.

TRANSKRYPCJA:
${transcript}`;

  try {
    const response = await openrouter.chat.completions.create({
      model: openRouterModel,
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = response.choices[0]?.message?.content ?? "";
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as Partial<LeadIntelligence>;

    const clean = (v: unknown): string | null => {
      if (typeof v !== "string") return null;
      const trimmed = v.trim();
      if (!trimmed || trimmed.toLowerCase() === "null") return null;
      return trimmed;
    };

    return {
      name: regexInfo.name ?? clean(parsed.name),
      email: regexInfo.email ?? clean(parsed.email),
      phone: regexInfo.phone ?? normalizePhone(clean(parsed.phone)),
      company: regexInfo.company ?? clean(parsed.company),
      requirements: clean(parsed.requirements),
    };
  } catch (err) {
    logger.warn({ err }, "AI contact extraction failed, falling back to regex only");
    return { ...regexInfo, requirements: null };
  }
}
