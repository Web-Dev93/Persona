import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  useCreateAnthropicConversation,
  useGetSessionByToken,
  useCompleteLead,
  useGetActivePersona,
  useGetPersonaBySlug,
  AnthropicMessage
} from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send, Loader2, ChevronLeft, Phone, Video, Heart, CheckCheck, Check,
  MoreVertical, Smile, Paperclip, Camera, Mic, ThumbsUp, Sparkles,
  ShieldCheck, HelpCircle, Hash, AtSign, Flame, Lock, ArrowUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CHAT_STYLES, ChatStyleConfig, getStyleConfig } from "@/lib/chat-styles";
import { getRealAvatarUrl } from "@/lib/advisor-avatars";

function fmt(iso: string) {
  try { return format(new Date(iso), "HH:mm"); } catch { return ""; }
}

/** Bubble backgrounds are plain CSS values, so gradients work as-is. */
function getBg(v: string): React.CSSProperties {
  return { background: v };
}

// ─── Message Bubble Component ──────────────────────────────────────────────────

function Bubble({
  msg,
  theme,
  personaInitial,
  personaPhoto,
  personaName,
}: {
  msg: AnthropicMessage;
  theme: ChatStyleConfig;
  personaInitial: string;
  personaPhoto: string | null;
  personaName: string;
}) {
  const isUser = msg.role === "user";
  const isWhatsApp = theme.id === "whatsapp";
  const isTelegram = theme.id === "telegram";
  const isApple = theme.id === "imessage";
  const isDiscord = theme.id === "discord";

  return (
    <div className={`flex items-end gap-2 mb-1.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && !isDiscord && (
        <Avatar className="w-8 h-8 shrink-0 shadow-sm border border-black/5">
          {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
          <AvatarFallback className="text-white text-xs font-semibold" style={{ background: theme.accentColor }}>
            {personaInitial}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Discord Avatar beside message */}
      {!isUser && isDiscord && (
        <Avatar className="w-9 h-9 shrink-0 self-start mt-0.5">
          {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
          <AvatarFallback className="text-white text-xs font-semibold bg-[#5865f2]">
            {personaInitial}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[76%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {/* Discord user header */}
        {!isUser && isDiscord && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="font-semibold text-xs text-white">{personaName}</span>
            <span className="bg-[#5865f2] text-white text-[9px] font-bold px-1 py-0.2 rounded">BOT</span>
            <span className="text-[10px] text-[#949ba4]">{fmt(msg.createdAt)}</span>
          </div>
        )}

        <div
          className="px-4 py-2.5 text-[14.5px] leading-relaxed shadow-sm transition-all"
          style={{
            ...(isUser
              ? {
                  ...getBg(theme.userBubble),
                  color: theme.userText,
                  borderRadius: isApple ? "18px 18px 4px 18px" : isWhatsApp ? "10px 10px 0px 10px" : "18px 18px 4px 18px",
                }
              : {
                  background: theme.botBubble,
                  border: theme.botBorder,
                  color: theme.botText,
                  borderRadius: isApple ? "18px 18px 18px 4px" : isWhatsApp ? "10px 10px 10px 0px" : "18px 18px 18px 4px",
                }),
          }}
        >
          {(() => {
            // Attachment notices are stored as plain text so they survive in the
            // transcript and the e-mail; in the bubble they render as a link.
            const att = msg.content.match(/^\[Załącznik\] (.+?) — (\S+)$/);
            if (!att) return <p className="whitespace-pre-wrap">{msg.content}</p>;
            return (
              <a
                href={att[2]}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 underline underline-offset-2"
              >
                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{att[1]}</span>
              </a>
            );
          })()}
        </div>

        {/* Timestamp and delivery receipts */}
        {!isDiscord && (
          <div className={`flex items-center gap-1 mt-0.5 px-1.5 ${isUser ? "flex-row-reverse" : ""}`}>
            <span
              className="text-[10px]"
              style={{ color: theme.isDark ? "rgba(255,255,255,0.4)" : isWhatsApp ? "#667781" : "#94a3b8" }}
            >
              {fmt(msg.createdAt)}
            </span>
            {isUser && (isWhatsApp || isTelegram || theme.showDoubleChecks) && (
              <CheckCheck className="w-3.5 h-3.5" style={{ color: isWhatsApp ? "#53bdeb" : isTelegram ? "#25D366" : theme.accentColor }} />
            )}
            {isUser && isApple && (
              <span className="text-[9px] text-[#8e8e93] font-medium">Doręczono</span>
            )}
          </div>
        )}
      </div>

      {isUser && !isDiscord && <div className="w-2 shrink-0" />}
    </div>
  );
}

// ─── Main Chat Component ───────────────────────────────────────────────────────

export default function ChatPage({ personaSlug }: { personaSlug?: string } = {}) {
  const { toast } = useToast();

  // Rendered inside the embeddable widget iframe (?embed=1): no app chrome.
  const isEmbedded =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("embed") === "1";

  const sessionKey = personaSlug ? `lead_session_token_${personaSlug}` : "lead_session_token";
  const [sessionToken, setSessionToken] = useState<string | null>(localStorage.getItem(sessionKey));

  const { data: activePersona } = useGetActivePersona({
    query: { queryKey: ["/api/admin/personas/active"], retry: false, enabled: !personaSlug }
  });
  const {
    data: slugPersona,
    isError: slugNotFound,
    isLoading: loadingSlugPersona,
  } = useGetPersonaBySlug(personaSlug ?? "", {
    query: { queryKey: ["/api/personas/by-slug", personaSlug], enabled: !!personaSlug, retry: false }
  });
  const persona = personaSlug ? slugPersona : activePersona;

  const {
    data: sessionData,
    isLoading: loadingSession,
    isError: sessionGone,
    refetch: refetchSession,
  } = useGetSessionByToken(sessionToken || "", {
    query: { enabled: !!sessionToken, queryKey: ["/api/leads/session", sessionToken], retry: false },
  });

  const createConversation = useCreateAnthropicConversation();
  const completeLead = useCompleteLead();

  const [messages, setMessages] = useState<AnthropicMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streaming, setStreaming] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // A token can outlive its conversation (database reset, a link opened against a
  // different environment). Drop it and start clean rather than retrying forever.
  useEffect(() => {
    if (!sessionGone) return;
    localStorage.removeItem(sessionKey);
    setSessionToken(null);
    setConversationId(null);
  }, [sessionGone, sessionKey]);

  useEffect(() => {
    if (sessionData?.messages) {
      setMessages(sessionData.messages);
      setConversationId(sessionData.id);
    }
  }, [sessionData]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming, isTyping]);

  const handleSend = async (text?: string) => {
    const content = (text ?? inputValue).trim();
    if (!content) return;
    setInputValue("");

    const temp: AnthropicMessage = {
      id: Date.now(),
      conversationId: conversationId || 0,
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, temp]);
    setIsTyping(true);

    try {
      let cid = conversationId;
      if (!cid) {
        const nc = await createConversation.mutateAsync({
          data: {
            title: content.slice(0, 50),
            sessionToken: crypto.randomUUID(),
            personaId: persona?.id ?? null
          }
        });
        cid = nc.id;
        setConversationId(nc.id);
        setSessionToken(nc.sessionToken);
        localStorage.setItem(sessionKey, nc.sessionToken);
      }

      const res = await fetch(`/api/anthropic/conversations/${cid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const lines = buf.split('\n');
        buf = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const p = JSON.parse(line.slice(6));
              if (p.content) {
                full += p.content;
                setStreaming(full);
              }
            } catch {}
          }
        }
      }

      setMessages(prev => [
        ...prev,
        { id: Date.now(), conversationId: cid!, role: "assistant", content: full, createdAt: new Date().toISOString() }
      ]);
      setStreaming("");
    } catch {
      setIsTyping(false);
      setStreaming("");
      toast({ title: "Błąd połączenia", description: "Nie udało się przesłać wiadomości.", variant: "destructive" });
      setMessages(prev => prev.filter(m => m.id !== temp.id));
    }
  };

  // Attachments: the composer's paperclip was decorative; it now posts to the
  // attachments endpoint and drops a note into the transcript.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    let cid = conversationId;
    if (!cid) {
      // A file can arrive before the first message, so open the conversation first.
      try {
        const nc = await createConversation.mutateAsync({
          data: {
            title: file.name.slice(0, 50),
            sessionToken: crypto.randomUUID(),
            personaId: persona?.id ?? null,
          },
        });
        cid = nc.id;
        setConversationId(nc.id);
        setSessionToken(nc.sessionToken);
        localStorage.setItem(sessionKey, nc.sessionToken);
      } catch {
        toast({ title: "Nie udało się rozpocząć rozmowy", variant: "destructive" });
        return;
      }
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("conversationId", String(cid));
      const res = await fetch("/api/leads/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Nie wysłano pliku", description: data.error, variant: "destructive" });
        return;
      }
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          conversationId: cid!,
          role: "user",
          content: `[Załącznik] ${data.fileName} — ${data.fileUrl}`,
          createdAt: new Date().toISOString(),
        },
      ]);
      toast({ title: "Plik wysłany", description: data.fileName });
    } catch {
      toast({ title: "Błąd wysyłki pliku", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const isCompleted = sessionData?.completed;
  const personaName = persona?.name ?? "Ania";
  const personaTitle = persona?.title ?? "";
  const personaPhoto = persona?.photoUrl || getRealAvatarUrl(personaName);
  const personaInitial = personaName.charAt(0).toUpperCase();

  const styleKey = persona?.effectiveStyle ?? "messenger";
  const theme = getStyleConfig(styleKey);
  const isWhatsApp = theme.id === "whatsapp";
  const isMessenger = theme.id === "messenger";
  const isInstagram = theme.id === "instagram";
  const isTelegram = theme.id === "telegram";
  const isApple = theme.id === "imessage";
  const isDating = theme.id === "dating";
  const isDiscord = theme.id === "discord";
  const isBanking = theme.id === "banking";
  const isIntercom = theme.id === "intercom";
  const isNeonAI = theme.id === "neon_ai";
  const isLuxury = theme.id === "luxury_gold";

  if (personaSlug && slugNotFound) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center gap-3 px-6 text-center" style={{ backgroundColor: theme.bg }}>
        <HelpCircle className="w-10 h-10" style={{ color: theme.accentColor }} />
        <p className="font-semibold text-base" style={{ color: theme.botText }}>
          Nie znaleziono doradcy
        </p>
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: theme.botText, opacity: 0.7 }}>
          Link, w który wszedłeś, wskazuje na doradcę „{personaSlug}", którego nie ma w systemie.
          Sprawdź adres lub skontaktuj się z osobą, która Ci go przesłała.
        </p>
      </div>
    );
  }

  if (personaSlug && loadingSlugPersona) {
    return (
      <div className="h-[100dvh] flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.accentColor }} />
      </div>
    );
  }

  if (sessionToken && loadingSession && !sessionData && messages.length === 0) {
    return (
      <div className="h-[100dvh] flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.accentColor }} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col select-none overflow-hidden" style={{ backgroundColor: theme.bg }}>
      {/* Top visual accent stripe */}
      {theme.topStripe && <div className="h-1 w-full shrink-0" style={{ background: theme.topStripe }} />}

      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <header
        style={{ background: theme.headerBg, borderBottom: theme.headerBorder }}
        className="flex items-center gap-3 px-3.5 py-2.5 z-10 shrink-0 shadow-sm"
      >
        {!isEmbedded && (
        <Link href="/admin">
          <button
            className="p-1.5 -ml-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            style={{ color: theme.headerText }}
            title="Wróć do panelu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        )}

        {/* Avatar with status indicator */}
        <div className="relative shrink-0">
          <Avatar className="w-10 h-10 ring-2 ring-white/10 shadow-sm">
            {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
            <AvatarFallback className="text-white font-semibold text-sm" style={{ ...getBg(theme.userBubble) }}>
              {personaInitial}
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
            style={{ backgroundColor: theme.onlineColor, borderColor: theme.headerBg }}
          />
        </div>

        {/* Name & Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-[15px] leading-tight truncate" style={{ color: theme.headerText }}>
              {personaName}
            </p>
            {isInstagram && (
              <span className="w-3.5 h-3.5 rounded-full bg-[#0095f6] flex items-center justify-center text-white text-[8px] font-bold">✓</span>
            )}
            {isBanking && (
              <span className="bg-amber-400/20 text-amber-300 text-[9px] font-semibold px-1.5 py-0.2 rounded border border-amber-400/30">VIP</span>
            )}
            {isNeonAI && (
              <span className="bg-cyan-500/20 text-cyan-300 text-[9px] font-semibold px-1.5 py-0.2 rounded border border-cyan-400/40 animate-pulse">NEURAL AI</span>
            )}
            {isLuxury && (
              <span className="bg-amber-500/20 text-amber-200 text-[9px] font-semibold px-1.5 py-0.2 rounded border border-amber-500/40">PRESTIGE</span>
            )}
          </div>
          <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: theme.onlineText }}>
            {personaTitle || (
              isWhatsApp ? "online" :
              isMessenger ? "Aktywny(a) teraz" :
              isInstagram ? "Aktywność: przed chwilą" :
              isTelegram ? "online" :
              isApple ? "iMessage" :
              isDiscord ? "Dostępny • Rozmawia z Tobą" :
              isBanking ? "Dostępna • Szyfrowana sesja" :
              isIntercom ? "Zwykle odpowiada w kilka minut" :
              isNeonAI ? "Neural Core 2.5 • Aktywny" :
              "Online"
            )}
          </p>
        </div>

        {/* Right header action buttons */}
        <div className="flex items-center gap-1 shrink-0" style={{ color: theme.headerText }}>
          {isWhatsApp && (
            <>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors"><Video className="w-4 h-4" /></button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors"><MoreVertical className="w-4 h-4" /></button>
            </>
          )}
          {isMessenger && (
            <>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[#0084ff]"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[#0084ff]"><Video className="w-4 h-4" /></button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[#0084ff]"><MoreVertical className="w-4 h-4" /></button>
            </>
          )}
          {isInstagram && (
            <>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><Video className="w-4 h-4" /></button>
            </>
          )}
          {isTelegram && (
            <>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors"><MoreVertical className="w-4 h-4" /></button>
            </>
          )}
          {isApple && (
            <div className="bg-[#e5e5ea] text-[#007aff] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />FaceTime
            </div>
          )}
          {isDating && (
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full text-rose-500 hover:bg-rose-50"><Heart className="w-4 h-4 fill-rose-500" /></button>
            </div>
          )}
          {isDiscord && (
            <div className="flex items-center gap-1 text-[#949ba4]">
              <button className="p-2 rounded hover:bg-white/5"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded hover:bg-white/5"><Video className="w-4 h-4" /></button>
            </div>
          )}
          {isBanking && (
            <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-800">
              <Lock className="w-3 h-3" />SSL 256-bit
            </div>
          )}
          {isNeonAI && (
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800">
              <Sparkles className="w-3 h-3" />AI Core
            </div>
          )}
        </div>
      </header>

      {/* ─── Chat Message Feed ────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3.5 py-4 space-y-2"
        style={{
          backgroundColor: theme.bg,
          backgroundImage: isWhatsApp
            ? `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)`
            : isTelegram
            ? `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)`
            : isBanking || isNeonAI || isLuxury
            ? `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)`
            : undefined,
          backgroundSize: "20px 20px",
        }}
      >
        {/* Security badge notice (WhatsApp / Banking / AI) */}
        {theme.showLockBadge && (
          <div className="flex justify-center my-2">
            <div
              className="text-[11px] px-3.5 py-1.5 rounded-lg text-center max-w-sm shadow-sm flex items-center gap-1.5"
              style={{
                backgroundColor: isWhatsApp ? "#ffeecd" : isBanking ? "#1e293b" : isNeonAI ? "#0f172a" : "rgba(0,0,0,0.05)",
                color: isWhatsApp ? "#54656f" : isBanking ? "#94a3b8" : isNeonAI ? "#38bdf8" : "inherit",
                border: theme.isDark ? "1px solid rgba(255,255,255,0.1)" : undefined,
              }}
            >
              <Lock className="w-3 h-3 shrink-0" />
              <span>{theme.lockBadgeText || "Wiadomości są szyfrowane metodą end-to-end"}</span>
            </div>
          </div>
        )}

        {/* Empty state / Welcome */}
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center py-6 space-y-3.5">
            {isDating && (
              <div className="w-full max-w-md mx-auto bg-gradient-to-r from-rose-500 to-orange-400 rounded-2xl p-4 text-white text-center shadow-lg mb-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-4 h-4 fill-white" />
                  <span className="font-bold text-sm tracking-wide uppercase">To dopasowanie!</span>
                  <Flame className="w-4 h-4 fill-white" />
                </div>
                <p className="text-white/90 text-[12px]">Ty i <strong>{personaName}</strong> polubiliście się nawzajem</p>
              </div>
            )}

            <div className="relative">
              <Avatar className="w-20 h-20 ring-4 shadow-xl" style={{ borderColor: theme.headerBg }}>
                {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
                <AvatarFallback className="text-white text-2xl font-bold" style={{ ...getBg(theme.userBubble) }}>
                  {personaInitial}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                style={{ background: theme.headerBg }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.onlineColor }} />
              </div>
            </div>

            <div className="text-center max-w-xs">
              {/* This sits on the message-area background, not the header, so it
                  takes botText — headerText is white in most themes. */}
              <p className="font-semibold text-base" style={{ color: theme.botText }}>
                {personaName}
              </p>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: theme.isDark ? "rgba(255,255,255,0.6)" : "#64748b" }}
              >
                {personaTitle || "Napisz wiadomość, aby rozpocząć rozmowę."}
              </p>
            </div>

            {/* Quick starter chips */}
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {isDating ? (
                ["Hej! 👋", "Cześć, jak mija dzień? 😊", "Co ciekawego u Ciebie?"].map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all hover:scale-105 active:scale-95 bg-white shadow-sm"
                    style={{ borderColor: theme.accentColor, color: theme.accentColor }}
                  >
                    {chip}
                  </button>
                ))
              ) : isWhatsApp || isMessenger ? (
                ["Dzień dobry! 👋", "Chcę zapytać o ofertę", "Potrzebuję wyceny"].map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all hover:scale-105 active:scale-95 bg-white/80 backdrop-blur-sm shadow-sm"
                    style={{ borderColor: `${theme.accentColor}40`, color: theme.accentColor }}
                  >
                    {chip}
                  </button>
                ))
              ) : (
                ["Dzień dobry", "Chcę poznać szczegóły", "Jak możemy rozpocząć?"].map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all hover:scale-105 active:scale-95 shadow-sm"
                    style={{ borderColor: `${theme.accentColor}50`, color: theme.accentColor }}
                  >
                    {chip}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <Bubble
            key={msg.id || i}
            msg={msg}
            theme={theme}
            personaInitial={personaInitial}
            personaPhoto={personaPhoto}
            personaName={personaName}
          />
        ))}

        {/* Assistant streaming in progress */}
        {streaming && (
          <div className="flex items-end gap-2 mb-1 justify-start">
            <Avatar className="w-8 h-8 shrink-0 shadow-sm">
              {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
              <AvatarFallback className="text-white text-xs font-semibold" style={{ background: theme.accentColor }}>
                {personaInitial}
              </AvatarFallback>
            </Avatar>
            <div className="max-w-[76%]">
              <div
                className="px-4 py-2.5 text-[14.5px] leading-relaxed shadow-sm rounded-2xl"
                style={{
                  background: theme.botBubble,
                  border: theme.botBorder,
                  color: theme.botText,
                }}
              >
                <p className="whitespace-pre-wrap">{streaming}</p>
                <span
                  className="inline-block w-1.5 h-3.5 ml-1 rounded-full animate-pulse align-middle"
                  style={{ backgroundColor: theme.accentColor }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && !streaming && (
          <div className="flex items-end gap-2 mb-1 justify-start">
            <Avatar className="w-8 h-8 shrink-0 shadow-sm">
              {personaPhoto && <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />}
              <AvatarFallback className="text-white text-xs font-semibold" style={{ background: theme.accentColor }}>
                {personaInitial}
              </AvatarFallback>
            </Avatar>
            <div
              className="px-4 py-3 flex items-center gap-1.5 shadow-sm rounded-2xl"
              style={{ background: theme.botBubble, border: theme.botBorder }}
            >
              {[0, 150, 300].map(delay => (
                <span
                  key={delay}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: theme.typingDot, animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Complete lead CTA after conversation progress */}
        {!isCompleted && messages.length >= 6 && (
          <div className="flex justify-center pt-3 pb-1">
            <button
              onClick={async () => {
                await completeLead.mutateAsync({ id: conversationId! });
                toast({ title: "Dane zostały przekazane do persony!" });
                refetchSession();
              }}
              disabled={completeLead.isPending || !conversationId}
              className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-lg transition-all active:scale-95 hover:brightness-110 disabled:opacity-60"
              style={{ ...getBg(theme.userBubble) }}
            >
              {completeLead.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <ShieldCheck className="w-4 h-4" />
              Zakończ i przekaż dane kontaktowe
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="flex justify-center pt-3 pb-1">
            <div
              className="text-xs px-4 py-2 rounded-full font-medium border shadow-sm flex items-center gap-1.5"
              style={{
                color: theme.accentColor,
                borderColor: `${theme.accentColor}30`,
                backgroundColor: `${theme.accentColor}10`,
              }}
            >
              <Check className="w-3.5 h-3.5" />
              Dziękujemy! Twoje zapytanie zostało zarejestrowane.
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom Input Bar ─────────────────────────────────────────────────── */}
      <div
        style={{ background: theme.headerBg, borderTop: theme.headerBorder }}
        className="px-3 py-2.5 shrink-0"
      >
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,.doc,.docx"
            onChange={handleFileChosen}
          />

          {/* Attachment control lives outside the per-theme icon clusters so every
              style offers it, not just the two that happened to draw a paperclip.
              It sits on the header background, so it takes the header's foreground
              token — accentColor is the same colour as headerBg in several themes. */}
          <button
            type="button"
            onClick={handlePickFile}
            disabled={isUploading}
            title="Dołącz plik"
            aria-label="Dołącz plik"
            className="p-1.5 shrink-0 rounded-full transition-opacity hover:opacity-70 disabled:opacity-40"
            style={{ color: theme.headerText, opacity: 0.75 }}
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
          </button>
          {/* Left social icons depending on theme */}
          {isWhatsApp && (
            <div className="flex items-center gap-1 text-[#8696a0]">
              <button type="button" className="p-1.5 hover:text-black/70 transition-colors"><Smile className="w-5 h-5" /></button>
            </div>
          )}

          {isMessenger && (
            <div className="flex items-center gap-1 text-[#0084ff]">
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><Camera className="w-5 h-5" /></button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><Mic className="w-5 h-5" /></button>
            </div>
          )}

          {isInstagram && (
            <div className="flex items-center gap-1 text-gray-500">
              <button type="button" className="p-1.5 hover:text-black transition-colors"><Camera className="w-5 h-5" /></button>
            </div>
          )}

          {isTelegram && (
            <div className="flex items-center gap-1 text-[#5288c1]">
            </div>
          )}

          {isApple && (
            <button type="button" className="w-8 h-8 rounded-full bg-[#8e8e93]/20 flex items-center justify-center text-[#8e8e93] font-bold text-lg hover:bg-[#8e8e93]/30">
              +
            </button>
          )}

          {/* Text Input */}
          <div
            className="flex-1 flex items-center rounded-full px-4 py-2 border transition-all"
            style={{
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
            }}
          >
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={
                isWhatsApp ? "Wpisz wiadomość..." :
                isMessenger ? "Napisz do firmy..." :
                isInstagram ? "Wyślij wiadomość..." :
                isTelegram ? "Wiadomość..." :
                isApple ? "iMessage..." :
                isDiscord ? `Wiadomość do @${personaName}` :
                isBanking ? "Wpisz wiadomość do doradcy..." :
                isNeonAI ? "Wprowadź prompt lub zapytanie neuronowe..." :
                "Napisz wiadomość..."
              }
              className="flex-1 bg-transparent text-[14.5px] outline-none"
              style={{
                color: theme.inputTextColor,
                caretColor: theme.accentColor,
              } as React.CSSProperties}
              disabled={!!isCompleted || isTyping}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          {/* Send or Quick Reaction Button */}
          {inputValue.trim() ? (
            <button
              type="submit"
              disabled={!!isCompleted || isTyping}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 shrink-0"
              style={{ ...getBg(theme.sendBtn) }}
            >
              {isApple ? <ArrowUp className="w-5 h-5" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          ) : (
            <>
              {theme.quickReactionIcon === "thumbsup" && (
                <button
                  type="button"
                  onClick={() => handleSend("👍")}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#0084ff] hover:bg-blue-50 transition-all active:scale-95 shrink-0"
                  title="Wyślij łapkę w górę"
                >
                  <ThumbsUp className="w-5 h-5 fill-[#0084ff]" />
                </button>
              )}
              {theme.quickReactionIcon === "heart" && (
                <button
                  type="button"
                  onClick={() => handleSend("❤️")}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all active:scale-95 shrink-0"
                  title="Wyślij serduszko"
                >
                  <Heart className="w-5 h-5 fill-rose-500" />
                </button>
              )}
              {theme.quickReactionIcon === "flame" && (
                <button
                  type="button"
                  onClick={() => handleSend("🔥")}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-all active:scale-95 shrink-0"
                  title="Wyślij płomień"
                >
                  <Flame className="w-5 h-5 fill-orange-500" />
                </button>
              )}
              {theme.quickReactionIcon === "sparkles" && (
                <button
                  type="button"
                  onClick={() => handleSend("✨")}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-950/40 transition-all active:scale-95 shrink-0"
                  title="Wyślij iskry AI"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              )}
              {theme.quickReactionIcon === "none" && (
                <button
                  type="button"
                  disabled={true}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 opacity-40 shrink-0"
                  style={{ ...getBg(theme.sendBtn) }}
                >
                  {isApple ? <ArrowUp className="w-5 h-5" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
