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
import { Send, Loader2, ChevronLeft, Phone, Video, MoreVertical, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

function formatTime(iso: string) {
  try { return format(new Date(iso), "HH:mm"); } catch { return ""; }
}

export default function ChatPage() {
  const { toast } = useToast();

  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem("lead_session_token")
  );

  const { data: persona } = useGetActivePersona({
    query: { queryKey: ["/api/admin/personas/active"], retry: false }
  });
  const { data: sessionData, isLoading: loadingSession, refetch: refetchSession } = useGetSessionByToken(sessionToken || "", {
    query: {
      enabled: !!sessionToken,
      queryKey: ["/api/leads/session", sessionToken]
    }
  });

  const createConversation = useCreateAnthropicConversation();
  const completeLead = useCompleteLead();

  const [messages, setMessages] = useState<AnthropicMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionData?.messages) {
      setMessages(sessionData.messages);
      setConversationId(sessionData.id);
    }
  }, [sessionData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const currentInput = inputValue.trim();
    setInputValue("");

    const tempMessage: AnthropicMessage = {
      id: Date.now(),
      conversationId: conversationId || 0,
      role: "user",
      content: currentInput,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);
    setIsTyping(true);

    try {
      let currentConvId = conversationId;

      if (!currentConvId) {
        const newConv = await createConversation.mutateAsync({
          data: { title: currentInput.slice(0, 50), sessionToken: crypto.randomUUID() }
        });
        currentConvId = newConv.id;
        setConversationId(newConv.id);
        setSessionToken(newConv.sessionToken);
        localStorage.setItem("lead_session_token", newConv.sessionToken);
      }

      const response = await fetch(`/api/anthropic/conversations/${currentConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentInput })
      });

      if (!response.ok) throw new Error("Failed to send message");

      setIsTyping(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      let currentAssistantMessage = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                currentAssistantMessage += parsed.content;
                setStreamingContent(currentAssistantMessage);
              }
            } catch {}
          }
        }
      }

      setMessages(prev => [...prev, {
        id: Date.now(),
        conversationId: currentConvId!,
        role: "assistant",
        content: currentAssistantMessage,
        createdAt: new Date().toISOString()
      }]);
      setStreamingContent("");

    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setStreamingContent("");
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości.",
        variant: "destructive"
      });
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const handleComplete = async () => {
    if (!conversationId) return;
    try {
      await completeLead.mutateAsync({ id: conversationId });
      toast({ title: "Wysłano!", description: "Skontaktujemy się wkrótce." });
      refetchSession();
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    }
  };

  const isCompleted = sessionData?.completed;
  const personaName = persona?.name ?? "Ania";
  const personaTitle = persona?.title ?? "";
  const personaPhoto = persona?.photoUrl ?? null;
  const personaInitial = personaName.charAt(0).toUpperCase();

  if (sessionToken && loadingSession && !sessionData) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#f5f5f5] relative">
      {/* Header — dating app style */}
      <header className="relative z-10 bg-white border-b border-gray-100 shadow-sm">
        {/* Gradient stripe at the very top */}
        <div className="h-0.5 w-full bg-gradient-to-r from-rose-400 via-pink-400 to-orange-300" />
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Back arrow */}
          <Link href="/admin">
            <button className="p-1.5 -ml-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>

          {/* Avatar with online ring */}
          <div className="relative shrink-0">
            <Avatar className="w-11 h-11 ring-2 ring-white shadow-md">
              {personaPhoto ? (
                <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />
              ) : null}
              <AvatarFallback
                className="text-white font-semibold text-base"
                style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
              >
                {personaInitial}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
          </div>

          {/* Name & status */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-[15px] leading-tight truncate">{personaName}</p>
            <p className="text-green-500 text-[11px] font-medium">
              {personaTitle ? personaTitle : "teraz aktywna"}
            </p>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full text-gray-400 hover:text-rose-400 hover:bg-rose-50 transition-all">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full text-gray-400 hover:text-rose-400 hover:bg-rose-50 transition-all">
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Match banner — shown only when no messages */}
      {messages.length === 0 && !isTyping && (
        <div className="mx-4 mt-4 mb-2 bg-gradient-to-r from-rose-500 to-orange-400 rounded-2xl p-4 text-white text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart className="w-4 h-4 fill-white" />
            <span className="font-bold text-sm tracking-wide uppercase">To dopasowanie!</span>
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <p className="text-white/80 text-[12px]">
            Ty i <strong>{personaName}</strong> polubiłeś{"\u00ad"}cie się nawzajem
          </p>
        </div>
      )}

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
      >
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center py-8 space-y-3">
            {/* Big avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl">
                {personaPhoto ? (
                  <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />
                ) : null}
                <AvatarFallback
                  className="text-white text-3xl font-bold"
                  style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
                >
                  {personaInitial}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-base">{personaName}</p>
              <p className="text-gray-400 text-sm mt-0.5">Napisz pierwszą wiadomość</p>
            </div>
            {/* Prompt chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {["Hej! 👋", "Cześć, jak się masz?", "Co u Ciebie?"].map(chip => (
                <button
                  key={chip}
                  onClick={() => setInputValue(chip)}
                  className="px-4 py-1.5 rounded-full border border-rose-200 text-rose-500 text-sm hover:bg-rose-50 transition-colors font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id || i}
              className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {!isUser && (
                <Avatar className="w-8 h-8 shrink-0 self-end shadow-sm">
                  {personaPhoto ? (
                    <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />
                  ) : null}
                  <AvatarFallback
                    className="text-white text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
                  >
                    {personaInitial}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-[72%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-[14.5px] leading-relaxed shadow-sm
                    ${isUser
                      ? "text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                    }
                  `}
                  style={isUser ? {
                    background: "linear-gradient(135deg, #f43f5e, #fb923c)"
                  } : {}}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTime(msg.createdAt)}</span>
              </div>

              {isUser && (
                <div className="w-8 shrink-0" />
              )}
            </div>
          );
        })}

        {/* Streaming */}
        {streamingContent && (
          <div className="flex justify-start items-end gap-2">
            <Avatar className="w-8 h-8 shrink-0 self-end shadow-sm">
              {personaPhoto ? (
                <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />
              ) : null}
              <AvatarFallback
                className="text-white text-xs font-semibold"
                style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
              >
                {personaInitial}
              </AvatarFallback>
            </Avatar>
            <div className="max-w-[72%]">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 text-[14.5px] text-gray-800 leading-relaxed shadow-sm">
                <p className="whitespace-pre-wrap">{streamingContent}</p>
                <span className="inline-block w-1 h-3.5 ml-0.5 rounded-full bg-rose-400 animate-pulse align-middle" />
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && !streamingContent && (
          <div className="flex justify-start items-end gap-2">
            <Avatar className="w-8 h-8 shrink-0 self-end shadow-sm">
              {personaPhoto ? (
                <AvatarImage src={personaPhoto} alt={personaName} className="object-cover" />
              ) : null}
              <AvatarFallback
                className="text-white text-xs font-semibold"
                style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
              >
                {personaInitial}
              </AvatarFallback>
            </Avatar>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && messages.length >= 6 && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={handleComplete}
              disabled={completeLead.isPending}
              className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
            >
              {completeLead.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <Heart className="w-4 h-4 fill-white" />
              Wyślij swoje dane kontaktowe
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="flex justify-center pt-4 pb-2">
            <div className="bg-rose-50 border border-rose-100 text-rose-500 text-sm px-5 py-2 rounded-full font-medium">
              Dziękujemy — odezwiemy się wkrótce
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-100 px-3 py-3">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2"
        >
          {/* Emoji / sticker button placeholder */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-rose-400 transition-colors shrink-0"
            onClick={() => {}}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 13s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" />
              <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex-1 flex items-center bg-gray-50 rounded-full px-4 py-2.5 border border-gray-200 focus-within:border-rose-300 focus-within:bg-white transition-all">
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Napisz wiadomość..."
              className="flex-1 bg-transparent text-gray-800 text-[14.5px] outline-none placeholder-gray-400"
              disabled={isCompleted || isTyping}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          {/* Send button */}
          {inputValue.trim() ? (
            <button
              type="submit"
              disabled={isCompleted || isTyping}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 shrink-0"
              style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)" }}
              onClick={() => setInputValue("❤️")}
            >
              <Heart className="w-4 h-4 text-white fill-white" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
