// ─── 10 Real-World, Clean Business Chat Styles for Websites ─────────────────

export interface ChatStyleConfig {
  id: string;
  name: string;
  badgeLabel: string;
  category: "komunikator" | "biznes" | "e-commerce";
  color: string;
  tagline: string;
  description: string;
  bg: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  onlineColor: string;
  onlineText: string;
  userBubble: string;
  userText: string;
  botBubble: string;
  botBorder: string;
  botText: string;
  inputBg: string;
  inputBorder: string;
  inputTextColor: string;
  sendBtn: string;
  typingDot: string;
  accentColor: string;
  bubbleIconColor: string;
  bubbleBg: string;
  isDark?: boolean;
  showDoubleChecks?: boolean;
  showLockBadge?: boolean;
  lockBadgeText?: string;
  sampleGreeting: string;
  /** Sample advisor line rendered in the admin style previews. */
  sampleLeadMessage: string;
  /** Sample visitor reply rendered in the admin style previews. */
  sampleUserReply: string;
  /** Thin accent bar painted above the chat header; omit for a flat header. */
  topStripe?: string;
  /** Icon offered as a one-tap reaction in the composer. */
  quickReactionIcon?: "thumbsup" | "heart" | "flame" | "sparkles" | "none";
  // Deep visual distinctions:
  bubbleVariant: "whatsapp" | "messenger" | "imessage" | "telegram" | "corporate" | "glass" | "luxury" | "metro";
  borderRadius: string;
  headerStyle: "whatsapp" | "messenger" | "ios" | "corporate" | "minimal";
  hasDoodleBg?: boolean;
  showStatusPill?: boolean;
  statusPillText?: string;
}

export const CHAT_STYLES: Record<string, ChatStyleConfig> = {
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp Business Authentic",
    badgeLabel: "WhatsApp",
    category: "komunikator",
    color: "#25D366",
    tagline: "Wierny styl WhatsApp z tapetą doodle, ptaszkami ✓✓ i zielonym paskiem",
    description: "Autentyczny WhatsApp: zielony nagłówek #075e54, tło w drobny wzór, dymki #d9fdd3, ptaszki doręczenia ✓✓.",
    bg: "#efeae2",
    headerBg: "#075e54",
    headerBorder: "1px solid #064e46",
    headerText: "#ffffff",
    onlineColor: "#25D366",
    onlineText: "#a3e635",
    userBubble: "#d9fdd3",
    userText: "#111b21",
    botBubble: "#ffffff",
    botBorder: "1px solid rgba(0,0,0,0.06)",
    botText: "#111b21",
    inputBg: "#ffffff",
    inputBorder: "1px solid #e2e8f0",
    inputTextColor: "#111b21",
    sendBtn: "#008069",
    typingDot: "#008069",
    accentColor: "#008069",
    bubbleBg: "#25D366",
    bubbleIconColor: "#ffffff",
    showDoubleChecks: true,
    showLockBadge: true,
    lockBadgeText: "Wiadomości szyfrowane end-to-end",
    sampleGreeting: "Dzień dobry! Z przyjemnością pomogę w doborze optymalnego rozwiązania.",
    sampleLeadMessage: "Dzień dobry! Chętnie przygotuję wstępną wycenę — proszę o kilka szczegółów.",
    sampleUserReply: "Dzień dobry, potrzebuję kuchni na wymiar 3x2 m.",
    topStripe: "linear-gradient(90deg, #25D366 0%, #075e54 100%)",
    quickReactionIcon: "thumbsup",
    bubbleVariant: "whatsapp",
    borderRadius: "0.25rem",
    headerStyle: "whatsapp",
    hasDoodleBg: true,
    showStatusPill: true,
    statusPillText: "Konto firmowe zweryfikowane"
  },

  messenger: {
    id: "messenger",
    name: "Facebook Messenger Meta",
    badgeLabel: "Messenger",
    category: "komunikator",
    color: "#0084ff",
    tagline: "Standardowy komunikator social media z gradientowymi dymkami",
    description: "Czyste białe tło, niebiesko-fioletowy gradient wypowiedzi, status Meta i kciuk w górę.",
    bg: "#ffffff",
    headerBg: "#ffffff",
    headerBorder: "1px solid #e5e7eb",
    headerText: "#111827",
    onlineColor: "#22c55e",
    onlineText: "#6b7280",
    userBubble: "linear-gradient(135deg, #0084ff 0%, #a033ff 100%)",
    userText: "#ffffff",
    botBubble: "#f0f2f5",
    botBorder: "1px solid transparent",
    botText: "#050505",
    inputBg: "#f0f2f5",
    inputBorder: "1px solid transparent",
    inputTextColor: "#050505",
    sendBtn: "#0084ff",
    typingDot: "#0084ff",
    accentColor: "#0084ff",
    bubbleBg: "#0084ff",
    bubbleIconColor: "#ffffff",
    sampleGreeting: "Cześć! W czym mogę Ci dzisiaj pomóc?",
    sampleLeadMessage: "Cześć! Powiedz proszę, czego dokładnie szukasz — dobiorę najlepszą opcję.",
    sampleUserReply: "Cześć, interesuje mnie strona dla mojej firmy.",
    topStripe: "linear-gradient(90deg, #0084ff 0%, #a033ff 100%)",
    quickReactionIcon: "thumbsup",
    bubbleVariant: "messenger",
    borderRadius: "1rem",
    headerStyle: "messenger",
    showStatusPill: true,
    statusPillText: "Aktywny(a) teraz"
  },

  imessage: {
    id: "imessage",
    name: "Apple iMessage iOS",
    badgeLabel: "iMessage",
    category: "komunikator",
    color: "#007aff",
    tagline: "Ekskluzywny styl Apple iOS z niebieskimi chmurkami",
    description: "Niebieskie chmurki iOS #007aff, szary dymek odpowiedzi, czysty minimalistyczny nagłówek i status 'Dostarczono'.",
    bg: "#f2f2f7",
    headerBg: "#ffffff",
    headerBorder: "1px solid #e5e5ea",
    headerText: "#000000",
    onlineColor: "#34c759",
    onlineText: "#8e8e93",
    userBubble: "#007aff",
    userText: "#ffffff",
    botBubble: "#e5e5ea",
    botBorder: "1px solid transparent",
    botText: "#000000",
    inputBg: "#ffffff",
    inputBorder: "1px solid #c7c7cc",
    inputTextColor: "#000000",
    sendBtn: "#007aff",
    typingDot: "#8e8e93",
    accentColor: "#007aff",
    bubbleBg: "#007aff",
    bubbleIconColor: "#ffffff",
    sampleGreeting: "Dzień dobry! Jak mogę pomóc w Twojej sprawie?",
    sampleLeadMessage: "Dzień dobry! Proszę opisać sprawę, a wrócę z konkretną propozycją.",
    sampleUserReply: "Dzień dobry, mam pytanie o dostępne terminy.",
    quickReactionIcon: "heart",
    bubbleVariant: "imessage",
    borderRadius: "1.1rem",
    headerStyle: "ios",
    showStatusPill: true,
    statusPillText: "iMessage • Bezpieczne połączenie"
  },

  telegram: {
    id: "telegram",
    name: "Telegram Cloud Minimal",
    badgeLabel: "Telegram",
    category: "komunikator",
    color: "#2481cc",
    tagline: "Błyskawiczny, lekki komunikator chmurowy",
    description: "Błękitny nagłówek Telegrama, subtelne tło, zielonkawe dymki użytkownika i status połączenia.",
    bg: "#8fa8b9",
    headerBg: "#5288c1",
    headerBorder: "1px solid #4173a7",
    headerText: "#ffffff",
    onlineColor: "#a3e635",
    onlineText: "#dbeafe",
    userBubble: "#effdde",
    userText: "#000000",
    botBubble: "#ffffff",
    botBorder: "1px solid rgba(0,0,0,0.05)",
    botText: "#000000",
    inputBg: "#ffffff",
    inputBorder: "1px solid #e2e8f0",
    inputTextColor: "#000000",
    sendBtn: "#5288c1",
    typingDot: "#5288c1",
    accentColor: "#5288c1",
    bubbleBg: "#2481cc",
    bubbleIconColor: "#ffffff",
    showDoubleChecks: true,
    sampleGreeting: "Witaj! Jestem do Twojej dyspozycji w kwestii doradztwa.",
    sampleLeadMessage: "Witam! Podeślę szczegóły — proszę powiedzieć, co jest najważniejsze.",
    sampleUserReply: "Cześć, szukam wsparcia przy wdrożeniu.",
    topStripe: "linear-gradient(90deg, #2AABEE 0%, #229ED9 100%)",
    quickReactionIcon: "sparkles",
    bubbleVariant: "telegram",
    borderRadius: "0.5rem",
    headerStyle: "minimal"
  },

  intercom_modern: {
    id: "intercom_modern",
    name: "Intercom SaaS Pro",
    badgeLabel: "SaaS Widget",
    category: "biznes",
    color: "#6366f1",
    tagline: "Nowoczesny widget dla firm IT, SaaS i startupów",
    description: "Głęboki indygo gradient, czyste karty z cieniami, status reakcji 'Zwykle w kilka minut'.",
    bg: "#f8fafc",
    headerBg: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    headerBorder: "1px solid #4338ca",
    headerText: "#ffffff",
    onlineColor: "#22c55e",
    onlineText: "#c7d2fe",
    userBubble: "#4f46e5",
    userText: "#ffffff",
    botBubble: "#ffffff",
    botBorder: "1px solid #e2e8f0",
    botText: "#1e293b",
    inputBg: "#ffffff",
    inputBorder: "1px solid #cbd5e1",
    inputTextColor: "#0f172a",
    sendBtn: "#4f46e5",
    typingDot: "#6366f1",
    accentColor: "#4f46e5",
    bubbleBg: "#4f46e5",
    bubbleIconColor: "#ffffff",
    sampleGreeting: "Cześć! Masz pytanie odnośnie wdrożenia lub cennika? Napisz śmiało!",
    sampleLeadMessage: "Cześć! Chętnie doprecyzuję cennik i zakres wdrożenia.",
    sampleUserReply: "Hej, ile kosztuje wdrożenie dla 10 osób?",
    topStripe: "linear-gradient(90deg, #1f8ded 0%, #6c5ce7 100%)",
    quickReactionIcon: "sparkles",
    bubbleVariant: "corporate",
    borderRadius: "0.25rem",
    headerStyle: "corporate",
    showStatusPill: true,
    statusPillText: "Odpowiada zwykle w 2 minuty"
  },

  web_widget: {
    id: "web_widget",
    name: "B2B Corporate Minimal",
    badgeLabel: "Corporate",
    category: "biznes",
    color: "#0f172a",
    tagline: "Klasyczny, rzeczowy widget dla firm handlowych i produkcyjnych",
    description: "Elegancki granatowo-biały widget na stronę, wysoka czytelność i proste geometryczne dymki.",
    bg: "#f8fafc",
    headerBg: "#0f172a",
    headerBorder: "1px solid #1e293b",
    headerText: "#ffffff",
    onlineColor: "#22c55e",
    onlineText: "#94a3b8",
    userBubble: "#0f172a",
    userText: "#ffffff",
    botBubble: "#ffffff",
    botBorder: "1px solid #e2e8f0",
    botText: "#0f172a",
    inputBg: "#ffffff",
    inputBorder: "1px solid #cbd5e1",
    inputTextColor: "#0f172a",
    sendBtn: "#0f172a",
    typingDot: "#0f172a",
    accentColor: "#0f172a",
    bubbleBg: "#0f172a",
    bubbleIconColor: "#ffffff",
    showLockBadge: true,
    lockBadgeText: "Bezpieczny kanał konsultacji biznesowej",
    sampleGreeting: "Dzień dobry! Zespół obsługi klienta jest do Twojej dyspozycji.",
    sampleLeadMessage: "Dzień dobry! Proszę opisać sprawę — odpowiem od razu.",
    sampleUserReply: "Dzień dobry, chciałbym poznać ofertę.",
    quickReactionIcon: "none",
    bubbleVariant: "corporate",
    borderRadius: "0.15rem",
    headerStyle: "corporate"
  },

  corporate_dark: {
    id: "corporate_dark",
    name: "Kancelaria & Legal Dark VIP",
    badgeLabel: "Legal Dark",
    category: "biznes",
    color: "#1e293b",
    tagline: "Dyskretny, ciemny motyw dla kancelarii prawnych i usług premium",
    description: "Ciemny grafit #0f172a, szafirowe dymki, certyfikat poufności i bezpieczeństwo SSL.",
    bg: "#0b1120",
    headerBg: "#1e293b",
    headerBorder: "1px solid rgba(255,255,255,0.1)",
    headerText: "#f8fafc",
    onlineColor: "#38bdf8",
    onlineText: "#94a3b8",
    userBubble: "#2563eb",
    userText: "#ffffff",
    botBubble: "#1e293b",
    botBorder: "1px solid rgba(255,255,255,0.12)",
    botText: "#e2e8f0",
    inputBg: "#1e293b",
    inputBorder: "1px solid rgba(255,255,255,0.15)",
    inputTextColor: "#f8fafc",
    sendBtn: "#2563eb",
    typingDot: "#38bdf8",
    accentColor: "#38bdf8",
    bubbleBg: "#1e293b",
    bubbleIconColor: "#38bdf8",
    isDark: true,
    showLockBadge: true,
    lockBadgeText: "Poufna sesja konsultacyjna • SSL 256-bit",
    sampleGreeting: "Dzień dobry. Zapewniam pełną poufność i profesjonalną analizę wstępną.",
    sampleLeadMessage: "Dzień dobry. Proszę o zarys sprawy — przygotuję wstępną analizę.",
    sampleUserReply: "Dzień dobry, potrzebujemy audytu umowy B2B.",
    topStripe: "linear-gradient(90deg, #1e3a8a 0%, #0f172a 100%)",
    quickReactionIcon: "none",
    bubbleVariant: "glass",
    borderRadius: "0.25rem",
    headerStyle: "corporate"
  },

  rose_luxury: {
    id: "rose_luxury",
    name: "Rose Boutique & Esthetic",
    badgeLabel: "Beauty & Clinic",
    category: "e-commerce",
    color: "#e11d48",
    tagline: "Elegancki motyw dla salonów beauty, medycyny estetycznej i butików",
    description: "Pudrowy róż, delikatne perłowe tło, luksusowy charakter i pomoc w doborze zabiegów.",
    bg: "#fff1f2",
    headerBg: "#e11d48",
    headerBorder: "1px solid #be123c",
    headerText: "#ffffff",
    onlineColor: "#22c55e",
    onlineText: "#ffe4e6",
    userBubble: "#e11d48",
    userText: "#ffffff",
    botBubble: "#ffffff",
    botBorder: "1px solid #fecdd3",
    botText: "#881337",
    inputBg: "#ffffff",
    inputBorder: "1px solid #fecdd3",
    inputTextColor: "#881337",
    sendBtn: "#e11d48",
    typingDot: "#e11d48",
    accentColor: "#e11d48",
    bubbleBg: "#e11d48",
    bubbleIconColor: "#ffffff",
    sampleGreeting: "Dzień dobry! Z przyjemnością doradzę w doborze zabiegu lub terminu.",
    sampleLeadMessage: "Dzień dobry! Podpowiem, który zabieg będzie najlepszy i kiedy jest wolny termin.",
    sampleUserReply: "Dzień dobry, interesuje mnie konsultacja.",
    topStripe: "linear-gradient(90deg, #f43f5e 0%, #be123c 100%)",
    quickReactionIcon: "heart",
    bubbleVariant: "luxury",
    borderRadius: "0.5rem",
    headerStyle: "corporate"
  },

  warm_amber: {
    id: "warm_amber",
    name: "Warm Amber Warsztat & Auto",
    badgeLabel: "Serwis & Auto",
    category: "biznes",
    color: "#d97706",
    tagline: "Ciepły, rzetelny styl dla mechaników, serwisu i rzemiosła",
    description: "Bursztynowy nagłówek, przyjazny i przejrzysty interfejs doradcy technicznego.",
    bg: "#fffbeb",
    headerBg: "#d97706",
    headerBorder: "1px solid #b45309",
    headerText: "#ffffff",
    onlineColor: "#22c55e",
    onlineText: "#fef3c7",
    userBubble: "#d97706",
    userText: "#ffffff",
    botBubble: "#ffffff",
    botBorder: "1px solid #fde68a",
    botText: "#451a03",
    inputBg: "#ffffff",
    inputBorder: "1px solid #fde68a",
    inputTextColor: "#451a03",
    sendBtn: "#d97706",
    typingDot: "#d97706",
    accentColor: "#d97706",
    bubbleBg: "#d97706",
    bubbleIconColor: "#ffffff",
    sampleGreeting: "Dzień dobry! Napisz, w czym możemy pomóc Twojej firmie lub pojazdowi.",
    sampleLeadMessage: "Dzień dobry! Proszę podać model i objawy — oszacuję koszt naprawy.",
    sampleUserReply: "Dzień dobry, stuka mi przednie zawieszenie.",
    topStripe: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
    quickReactionIcon: "flame",
    bubbleVariant: "corporate",
    borderRadius: "0.25rem",
    headerStyle: "corporate"
  },

  metro_slate: {
    id: "metro_slate",
    name: "Windows Metro Minimal Flat",
    badgeLabel: "Metro Flat",
    category: "biznes",
    color: "#0284c7",
    tagline: "Minimalistyczny, geometryczny interfejs kafelkowy",
    description: "Ostre kąty, minimalistyczne kafelki, wysoki kontrast i maksymalna czytelność.",
    bg: "#f1f5f9",
    headerBg: "#0284c7",
    headerBorder: "1px solid #0369a1",
    headerText: "#ffffff",
    onlineColor: "#38bdf8",
    onlineText: "#e0f2fe",
    userBubble: "#0284c7",
    userText: "#ffffff",
    botBubble: "#ffffff",
    botBorder: "1px solid #cbd5e1",
    botText: "#0f172a",
    inputBg: "#ffffff",
    inputBorder: "1px solid #cbd5e1",
    inputTextColor: "#0f172a",
    sendBtn: "#0284c7",
    typingDot: "#0284c7",
    accentColor: "#0284c7",
    bubbleBg: "#0284c7",
    bubbleIconColor: "#ffffff",
    sampleGreeting: "Witaj. W czym mogę pomóc Twojej firmie?",
    sampleLeadMessage: "Dzień dobry. Proszę o szczegóły zapytania — wrócę z rekomendacją.",
    sampleUserReply: "Dzień dobry, proszę o kontakt w sprawie oferty.",
    quickReactionIcon: "none",
    bubbleVariant: "metro",
    borderRadius: "0px",
    headerStyle: "minimal"
  }
};

export const CHAT_STYLES_LIST: ChatStyleConfig[] = Object.values(CHAT_STYLES);

/**
 * Style ids used before the catalogue was consolidated to the ten styles above.
 * Personas stored in the database still carry them, so they are mapped rather
 * than silently falling back to WhatsApp.
 */
export const LEGACY_STYLE_ALIASES: Record<string, string> = {
  banking: "corporate_dark",
  casual: "messenger",
  dating: "rose_luxury",
  instagram: "rose_luxury",
  intercom: "intercom_modern",
  glassmorphism: "web_widget",
  ios_minimal: "imessage",
  professional: "corporate_dark",
  discord: "metro_slate",
  neon_ai: "corporate_dark",
  luxury_gold: "rose_luxury",
};

export function resolveStyleId(id: string | null | undefined): string {
  if (!id) return "whatsapp";
  if (CHAT_STYLES[id]) return id;
  const alias = LEGACY_STYLE_ALIASES[id];
  return alias && CHAT_STYLES[alias] ? alias : "whatsapp";
}

export function getStyleConfig(id: string | null | undefined): ChatStyleConfig {
  return CHAT_STYLES[resolveStyleId(id)];
}

export function generateStylesheetCSS(theme: ChatStyleConfig): string {
  return `/* ==========================================================
   LeadTrap Design System — Theme: ${theme.name}
   ========================================================== */

:root {
  --chat-bg: ${theme.bg};
  --chat-header-bg: ${theme.headerBg};
  --chat-header-text: ${theme.headerText};
  --chat-accent-color: ${theme.accentColor};
  --chat-user-bubble: ${theme.userBubble};
  --chat-user-text: ${theme.userText};
  --chat-bot-bubble: ${theme.botBubble};
  --chat-bot-text: ${theme.botText};
}

.chat-frame {
  background: var(--chat-bg);
  color: var(--chat-bot-text);
}
`;
}

export interface EmbedOptions {
  /** Slug of the persona that should answer; falls back to the active persona. */
  personaSlug?: string | null;
  theme?: string;
  accentColor?: string;
  welcomeText?: string;
  position?: "right" | "left";
}

/**
 * Builds the snippet a client pastes into their site. Accepts either a full
 * options object or just a style id, so older call sites keep working.
 */
export function generateEmbedScript(
  personaSlug: string,
  options: EmbedOptions | string = {},
): string {
  const opts: EmbedOptions = typeof options === "string" ? { theme: options } : options;
  const theme = getStyleConfig(opts.theme);
  const slug = (opts.personaSlug ?? personaSlug ?? "").trim();
  const accentColor = opts.accentColor ?? theme.accentColor;
  const welcomeText = opts.welcomeText ?? theme.sampleGreeting;
  const position = opts.position ?? "right";
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://twoja-domena.pl";

  const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  return `<!-- Persona\u2122 Web Widget Embed Code -->
<script>
  window.LeadTrapConfig = {
    personaSlug: "${escape(slug)}",
    theme: "${escape(theme.id)}",
    accentColor: "${escape(accentColor)}",
    welcomeText: "${escape(welcomeText)}",
    position: "${position}"
  };
</script>
<script src="${origin}/widget.js" async></script>`;
}
