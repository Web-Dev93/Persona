import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  useCreateAnthropicConversation,
  useGetSessionByToken,
  useCompleteLead,
  useGetActivePersona,
  AnthropicMessage
} from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, ChevronLeft, Phone, Video, Heart, Settings, CheckCheck, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

function fmt(iso: string) { try { return format(new Date(iso), "HH:mm"); } catch { return ""; } }

// ─── Theme definitions ─────────────────────────────────────────────────────────

interface ChatTheme {
  bg: string;
  headerBg: string;
  headerBorder: string;
  onlineColor: string;
  onlineText: string;
  userBubble: string | { gradient: string };
  userText: string;
  botBubble: string;
  botBorder: string;
  botText: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  sendBtn: string | { gradient: string };
  typingDot: string;
  accentColor: string;
  topStripe?: string;
  showLockBadge?: boolean;
  matchBanner?: { gradient: string; text: string };
  fontClass?: string;
}

const THEMES: Record<string, ChatTheme> = {
  dating: {
    bg: "#f5f5f5",
    headerBg: "#ffffff",
    headerBorder: "1px solid #f0f0f0",
    onlineColor: "#22c55e",
    onlineText: "#22c55e",
    userBubble: { gradient: "linear-gradient(135deg, #f43f5e, #fb923c)" },
    userText: "#ffffff",
    botBubble: "#ffffff",
    botBorder: "1px solid #f0f0f0",
    botText: "#1a1a1a",
    inputBg: "#f8f8f8",
    inputBorder: "#e5e7eb",
    inputFocusBorder: "#f43f5e",
    sendBtn: { gradient: "linear-gradient(135deg, #f43f5e, #fb923c)" },
    typingDot: "#f43f5e",
    accentColor: "#f43f5e",
    topStripe: "linear-gradient(90deg, #f43f5e, #fb923c)",
    matchBanner: { gradient: "linear-gradient(135deg, #f43f5e, #fb923c)", text: "#ffffff" },
    showLockBadge: false,
  },
  professional: {
    bg: "#f8fafc",
    headerBg: "#ffffff",
    headerBorder: "1px solid #e2e8f0",
    onlineColor: "#22c55e",
    onlineText: "#64748b",
    userBubble: { gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
    userText: "#ffffff",
    botBubble: "#ffffff",
    botBorder: "1px solid #e2e8f0",
    botText: "#1e293b",
    inputBg: "#f1f5f9",
    inputBorder: "#cbd5e1",
    inputFocusBorder: "#4f46e5",
    sendBtn: { gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
    typingDot: "#4f46e5",
    accentColor: "#4f46e5",
    topStripe: "linear-gradient(90deg, #4f46e5, #7c3aed)",
    showLockBadge: false,
  },
  messenger: {
    bg: "#111b21",
    headerBg: "#1a1a1a",
    headerBorder: "1px solid rgba(255,255,255,0.05)",
    onlineColor: "#25D366",
    onlineText: "#25D366",
    userBubble: "#005c4b",
    userText: "#e9edef",
    botBubble: "#202c33",
    botBorder: "1px solid rgba(255,255,255,0.05)",
    botText: "#e9edef",
    inputBg: "#2a2a2a",
    inputBorder: "transparent",
    inputFocusBorder: "#25D366",
    sendBtn: "#25D366",
    typingDot: "#8696a0",
    accentColor: "#25D366",
    showLockBadge: true,
    fontClass: "",
  },
  casual: {
    bg: "#fffbeb",
    headerBg: "#ffffff",
    headerBorder: "1px solid #fde68a",
    onlineColor: "#f59e0b",
    onlineText: "#d97706",
    userBubble: { gradient: "linear-gradient(135deg, #f59e0b, #10b981)" },
    userText: "#ffffff",
    botBubble: "#ffffff",
    botBorder: "1px solid #fde68a",
    botText: "#1a1a1a",
    inputBg: "#fef3c7",
    inputBorder: "#fde68a",
    inputFocusBorder: "#f59e0b",
    sendBtn: { gradient: "linear-gradient(135deg, #f59e0b, #10b981)" },
    typingDot: "#f59e0b",
    accentColor: "#f59e0b",
    topStripe: "linear-gradient(90deg, #f59e0b, #10b981)",
    showLockBadge: false,
  },
  banking: {
    bg: "#0f172a",
    headerBg: "#1e293b",
    headerBorder: "1px solid rgba(255,255,255,0.08)",
    onlineColor: "#38bdf8",
    onlineText: "#94a3b8",
    userBubble: { gradient: "linear-gradient(135deg, #1e3a5f, #1d4ed8)" },
    userText: "#e2e8f0",
    botBubble: "#1e293b",
    botBorder: "1px solid rgba(255,255,255,0.1)",
    botText: "#cbd5e1",
    inputBg: "#1e293b",
    inputBorder: "rgba(255,255,255,0.08)",
    inputFocusBorder: "#38bdf8",
    sendBtn: { gradient: "linear-gradient(135deg, #1e3a5f, #1d4ed8)" },
    typingDot: "#38bdf8",
    accentColor: "#38bdf8",
    showLockBadge: false,
    fontClass: "font-serif",
  },
};

function getTheme(style: string | null | undefined): ChatTheme {
  return THEMES[style ?? "professional"] ?? THEMES.professional;
}

function getBg(v: string | { gradient: string }): React.CSSProperties {
  if (typeof v === "string") return { backgroundColor: v };
  return { background: v.gradient };
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, theme, personaInitial, personaPhoto, personaName, isMessenger }: {
  msg: AnthropicMessage;
  theme: ChatTheme;
  personaInitial: string;
  personaPhoto: string | null;
  personaName: string;
  isMessenger: boolean;
}) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex items-end gap-2 mb-0.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="w-8 h-8 shrink-0 shadow-sm">
          {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
          <AvatarFallback className="text-white text-xs font-semibold" style={{ background: theme.accentColor }}>
            {personaInitial}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[72%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="px-4 py-2.5 rounded-2xl text-[14.5px] leading-relaxed shadow-sm"
          style={{
            ...(isUser
              ? { ...getBg(theme.userBubble), color: theme.userText, borderRadius: "18px 18px 4px 18px" }
              : { backgroundColor: theme.botBubble, border: theme.botBorder, color: theme.botText, borderRadius: "18px 18px 18px 4px" }),
          }}
        >
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px]" style={{ color: isMessenger ? "#8696a0" : "#94a3b8" }}>{fmt(msg.createdAt)}</span>
          {isUser && isMessenger && <CheckCheck className="w-3 h-3" style={{ color: "#53bdeb" }} />}
        </div>
      </div>
      {isUser && <div className="w-8 shrink-0" />}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatPage() {
  const { toast } = useToast();

  const [sessionToken, setSessionToken] = useState<string | null>(localStorage.getItem("lead_session_token"));
  const { data: persona } = useGetActivePersona({ query: { queryKey: ["/api/admin/personas/active"], retry: false } });
  const { data: sessionData, isLoading: loadingSession, refetch: refetchSession } = useGetSessionByToken(sessionToken || "", {
    query: { enabled: !!sessionToken, queryKey: ["/api/leads/session", sessionToken] }
  });

  const createConversation = useCreateAnthropicConversation();
  const completeLead = useCompleteLead();

  const [messages, setMessages] = useState<AnthropicMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streaming, setStreaming] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionData?.messages) { setMessages(sessionData.messages); setConversationId(sessionData.id); }
  }, [sessionData]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming, isTyping]);

  const handleSend = async (text?: string) => {
    const content = (text ?? inputValue).trim();
    if (!content) return;
    setInputValue("");

    const temp: AnthropicMessage = { id: Date.now(), conversationId: conversationId || 0, role: "user", content, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);
    setIsTyping(true);

    try {
      let cid = conversationId;
      if (!cid) {
        const nc = await createConversation.mutateAsync({
          data: { title: content.slice(0, 50), sessionToken: crypto.randomUUID(), personaId: persona?.id ?? null }
        });
        cid = nc.id;
        setConversationId(nc.id);
        setSessionToken(nc.sessionToken);
        localStorage.setItem("lead_session_token", nc.sessionToken);
      }

      const res = await fetch(`/api/anthropic/conversations/${cid}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error();

      setIsTyping(false);
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      if (!reader) throw new Error();

      let full = "", buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try { const p = JSON.parse(line.slice(6)); if (p.content) { full += p.content; setStreaming(full); } } catch {}
          }
        }
      }

      setMessages(prev => [...prev, { id: Date.now(), conversationId: cid!, role: "assistant", content: full, createdAt: new Date().toISOString() }]);
      setStreaming("");
    } catch {
      setIsTyping(false); setStreaming("");
      toast({ title: "Błąd", description: "Nie udało się wysłać.", variant: "destructive" });
      setMessages(prev => prev.filter(m => m.id !== temp.id));
    }
  };

  const isCompleted = sessionData?.completed;
  const personaName = persona?.name ?? "Ania";
  const personaTitle = persona?.title ?? "";
  const personaPhoto = persona?.photoUrl ?? null;
  const personaInitial = personaName.charAt(0).toUpperCase();
  const style = persona?.effectiveStyle ?? "dating";
  const theme = getTheme(style);
  const isDark = style === "messenger" || style === "banking";
  const isMessenger = style === "messenger";
  const isDating = style === "dating";

  if (sessionToken && loadingSession && !sessionData) {
    return (
      <div className="h-[100dvh] flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.accentColor }} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col" style={{ backgroundColor: theme.bg }}>
      {/* Top gradient stripe */}
      {theme.topStripe && <div className="h-0.5 w-full" style={{ background: theme.topStripe }} />}

      {/* Header */}
      <header style={{ backgroundColor: theme.headerBg, borderBottom: theme.headerBorder }} className="flex items-center gap-3 px-3 py-2.5 z-10">
        <Link href="/admin">
          <button className="p-1.5 -ml-1 rounded-full transition-colors" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>

        <div className="relative shrink-0">
          <Avatar className="w-11 h-11 ring-2 ring-white/10 shadow-md">
            {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
            <AvatarFallback className="text-white font-semibold text-base" style={{ ...getBg(theme.userBubble) }}>
              {personaInitial}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ backgroundColor: theme.onlineColor, borderColor: theme.headerBg }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-[15px] leading-tight truncate ${isDark ? "text-white" : "text-gray-900"} ${theme.fontClass ?? ""}`}>
            {personaName}
          </p>
          <p className="text-[11px] font-medium" style={{ color: theme.onlineText }}>
            {personaTitle || (isMessenger ? "online" : style === "banking" ? "dostępna" : "teraz aktywna")}
          </p>
        </div>

        <div className="flex items-center gap-0.5">
          {isDating && (
            <>
              <button className="p-2 rounded-full transition-colors" style={{ color: "#d1d5db" }}><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-full transition-colors" style={{ color: "#d1d5db" }}><Video className="w-4 h-4" /></button>
            </>
          )}
          {(style === "professional" || style === "banking") && (
            <button className="p-2 rounded-full" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}><MoreVertical className="w-4 h-4" /></button>
          )}
        </div>
      </header>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{
          backgroundColor: theme.bg,
          backgroundImage: isMessenger ? `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)` : undefined,
          backgroundSize: isMessenger ? "24px 24px" : undefined,
        }}
      >
        {/* Empty state */}
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center py-8 space-y-4">
            {isDating && (
              <div className="w-full max-w-md mx-auto bg-gradient-to-r from-rose-500 to-orange-400 rounded-2xl p-4 text-white text-center shadow-lg mb-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Heart className="w-4 h-4 fill-white" />
                  <span className="font-bold text-sm tracking-wide uppercase">To dopasowanie!</span>
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <p className="text-white/80 text-[12px]">Ty i <strong>{personaName}</strong> polubiłeś{"\u00ad"}cie się nawzajem</p>
              </div>
            )}

            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 shadow-xl" style={{ '--tw-ring-color': isDark ? 'rgba(255,255,255,0.1)' : 'white' } as any}>
                {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
                <AvatarFallback className="text-white text-3xl font-bold" style={{ ...getBg(theme.userBubble) }}>
                  {personaInitial}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: theme.headerBg, border: `2px solid ${theme.headerBg}` }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ ...getBg(theme.userBubble) }}>
                  {isDating ? <Heart className="w-3 h-3 text-white fill-white" /> : <span className="text-white text-[9px] font-bold">{personaInitial}</span>}
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"} ${theme.fontClass ?? ""}`}>{personaName}</p>
              <p className="text-sm mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                {isDating ? "Napisz pierwszą wiadomość" : isMessenger ? "Napisz wiadomość, żeby rozpocząć rozmowę" : "Jak mogę Ci pomóc?"}
              </p>
            </div>

            {/* Starter chips */}
            {isDating && (
              <div className="flex flex-wrap gap-2 justify-center">
                {["Hej! 👋", "Cześć, jak się masz?", "Co u Ciebie?"].map(chip => (
                  <button key={chip} onClick={() => handleSend(chip)}
                    className="px-4 py-1.5 rounded-full border text-sm font-medium transition-colors"
                    style={{ borderColor: theme.accentColor, color: theme.accentColor }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {isMessenger && (
              <div className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full" style={{ backgroundColor: `${theme.accentColor}15`, color: `${theme.accentColor}90` }}>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
                Wiadomości są szyfrowane
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <Bubble key={msg.id || i} msg={msg} theme={theme} personaInitial={personaInitial} personaPhoto={personaPhoto} personaName={personaName} isMessenger={isMessenger} />
        ))}

        {/* Streaming */}
        {streaming && (
          <div className="flex items-end gap-2 mb-0.5 justify-start">
            <Avatar className="w-8 h-8 shrink-0 shadow-sm">
              {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
              <AvatarFallback className="text-white text-xs font-semibold" style={{ background: theme.accentColor }}>{personaInitial}</AvatarFallback>
            </Avatar>
            <div className="max-w-[72%]">
              <div className="px-4 py-2.5 text-[14.5px] leading-relaxed shadow-sm" style={{ backgroundColor: theme.botBubble, border: theme.botBorder, color: theme.botText, borderRadius: "18px 18px 18px 4px" }}>
                <p className="whitespace-pre-wrap">{streaming}</p>
                <span className="inline-block w-1 h-3.5 ml-0.5 rounded-full animate-pulse align-middle" style={{ backgroundColor: theme.accentColor }} />
              </div>
            </div>
          </div>
        )}

        {/* Typing */}
        {isTyping && !streaming && (
          <div className="flex items-end gap-2 mb-0.5 justify-start">
            <Avatar className="w-8 h-8 shrink-0 shadow-sm">
              {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
              <AvatarFallback className="text-white text-xs font-semibold" style={{ background: theme.accentColor }}>{personaInitial}</AvatarFallback>
            </Avatar>
            <div className="px-4 py-3.5 flex items-center gap-1.5 shadow-sm" style={{ backgroundColor: theme.botBubble, border: theme.botBorder, borderRadius: "18px 18px 18px 4px" }}>
              {[0, 150, 300].map(delay => (
                <span key={delay} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: theme.typingDot, animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Complete / completed */}
        {!isCompleted && messages.length >= 6 && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={async () => {
                await completeLead.mutateAsync({ id: conversationId! });
                toast({ title: "Wysłano!" });
                refetchSession();
              }}
              disabled={completeLead.isPending || !conversationId}
              className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-60"
              style={{ ...getBg(theme.userBubble) }}
            >
              {completeLead.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isDating && <Heart className="w-4 h-4 fill-white" />}
              Wyślij dane kontaktowe
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="flex justify-center pt-4 pb-2">
            <div className="text-sm px-5 py-2 rounded-full font-medium border" style={{ color: theme.accentColor, borderColor: `${theme.accentColor}30`, backgroundColor: `${theme.accentColor}10` }}>
              Dziękujemy — odezwiemy się wkrótce
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{ backgroundColor: theme.headerBg, borderTop: theme.headerBorder }} className="px-3 py-3">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          {isDating && (
            <button type="button" className="p-2 shrink-0" style={{ color: "#d1d5db" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path d="M8 13s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" /><line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <div className="flex-1 flex items-center rounded-full px-4 py-2.5 border transition-all" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={style === "banking" ? "Wpisz wiadomość..." : "Napisz wiadomość..."}
              className="flex-1 bg-transparent text-[14.5px] outline-none"
              style={{ color: isDark ? "#e2e8f0" : "#1a1a1a", caretColor: theme.accentColor } as React.CSSProperties}
              disabled={!!isCompleted || isTyping}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
          </div>

          {inputValue.trim() ? (
            <button type="submit" disabled={!!isCompleted || isTyping}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 shrink-0"
              style={{ ...getBg(theme.sendBtn) }}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 shrink-0"
              style={{ ...getBg(theme.sendBtn) }}
              onClick={() => isDating ? handleSend("❤️") : undefined}
            >
              {isDating ? <Heart className="w-4 h-4 fill-white" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
