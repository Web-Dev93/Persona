import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  useCreateAnthropicConversation,
  useGetSessionByToken,
  useCompleteLead,
  useGetAdminSettings,
  AnthropicMessage
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import consultantPlaceholder from "../assets/consultant-default.jpg";

export default function ChatPage() {
  const { toast } = useToast();
  
  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem("lead_session_token")
  );

  const { data: settings, isLoading: loadingSettings } = useGetAdminSettings();
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

  // Sync session messages on load
  useEffect(() => {
    if (sessionData && sessionData.messages) {
      setMessages(sessionData.messages);
      setConversationId(sessionData.id);
    }
  }, [sessionData]);

  // Scroll to bottom when messages change
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
    
    // Optimistic user message
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
        // Create new conversation
        const newConv = await createConversation.mutateAsync({
          data: { title: currentInput.slice(0, 50), sessionToken: crypto.randomUUID() }
        });
        
        currentConvId = newConv.id;
        setConversationId(newConv.id);
        setSessionToken(newConv.sessionToken);
        localStorage.setItem("lead_session_token", newConv.sessionToken);
      }

      // Handle SSE Streaming using raw fetch since we need the stream
      const response = await fetch(`/api/anthropic/conversations/${currentConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentInput })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

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
        
        // Process complete lines
        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === "[DONE]") continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.done) {
                // Done parsing
              } else if (parsed.content) {
                currentAssistantMessage += parsed.content;
                setStreamingContent(currentAssistantMessage);
              }
            } catch (e) {
              console.error("Failed to parse SSE data", e);
            }
          }
        }
      }

      // Once done, add the final assistant message and clear streaming content
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
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      // Remove optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const handleComplete = async () => {
    if (!conversationId) return;
    try {
      await completeLead.mutateAsync({ id: conversationId });
      toast({
        title: "Dziękujemy!",
        description: "Podsumowanie zostało wysłane. Skontaktujemy się z Tobą wkrótce.",
      });
      refetchSession();
    } catch (error) {
      toast({
        title: "Error",
        description: "Wystąpił błąd podczas wysyłania podsumowania.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!conversationId) {
      toast({
        title: "Błąd",
        description: "Musisz najpierw rozpocząć rozmowę, aby wysłać plik.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversationId.toString());

    try {
      const res = await fetch("/api/leads/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      
      toast({
        title: "Plik wysłany",
        description: "Pomyślnie załączono plik do rozmowy.",
      });
      
      // Optionally we could fetch session messages or add a system message here
      refetchSession();
    } catch (err) {
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać pliku.",
        variant: "destructive"
      });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCompleted = sessionData?.completed;

  if (loadingSettings || (sessionToken && loadingSession && !sessionData)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const consultantName = settings?.consultantName || "Marcin Kowalski";
  const consultantTitle = settings?.consultantTitle || "Partner & IT Strategist";
  const consultantPhoto = settings?.consultantPhotoUrl || consultantPlaceholder;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-primary/10 shadow-sm">
              <AvatarImage src={consultantPhoto} alt={consultantName} className="object-cover" />
              <AvatarFallback>{consultantName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-lg leading-tight tracking-tight text-primary">
                {consultantName}
              </h1>
              <p className="text-sm text-muted-foreground font-mono tracking-tight">
                {consultantTitle}
              </p>
            </div>
          </div>
          <Link href="/admin" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
            admin
          </Link>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pb-24 scroll-smooth"
        >
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-12 animate-in fade-in zoom-in duration-500">
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarImage src={consultantPhoto} alt={consultantName} className="object-cover" />
                <AvatarFallback>{consultantName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-semibold text-primary">Jak możemy pomóc?</h2>
                <p className="text-muted-foreground text-sm">
                  Opisz swoje wyzwanie biznesowe. Jestem tu, aby doradzić Ci w zakresie strategii IT i transformacji cyfrowej.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-300`}
            >
              {msg.role === "assistant" && (
                <Avatar className="w-8 h-8 mt-auto mr-3 border border-border shrink-0">
                  <AvatarImage src={consultantPhoto} alt={consultantName} className="object-cover" />
                  <AvatarFallback>{consultantName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm
                  ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border/50 text-card-foreground rounded-bl-sm"
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Streaming Message */}
          {streamingContent && (
             <div className="flex w-full justify-start animate-in fade-in duration-300">
              <Avatar className="w-8 h-8 mt-auto mr-3 border border-border shrink-0">
                <AvatarImage src={consultantPhoto} alt={consultantName} className="object-cover" />
                <AvatarFallback>{consultantName.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm bg-card border border-border/50 text-card-foreground rounded-bl-sm">
                {streamingContent}
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary/40 animate-pulse align-middle" />
              </div>
           </div>
          )}

          {/* Typing Indicator */}
          {isTyping && !streamingContent && (
             <div className="flex w-full justify-start animate-in fade-in duration-300">
              <Avatar className="w-8 h-8 mt-auto mr-3 border border-border shrink-0">
                <AvatarImage src={consultantPhoto} alt={consultantName} className="object-cover" />
                <AvatarFallback>{consultantName.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="rounded-2xl px-5 py-4 bg-card border border-border/50 rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
           </div>
          )}
          
          {/* Complete Button */}
          {!isCompleted && messages.length >= 6 && (
            <div className="flex justify-center pt-6 pb-2 animate-in fade-in duration-500">
              <Button 
                onClick={handleComplete}
                className="rounded-full shadow-lg hover:shadow-xl transition-all"
                disabled={completeLead.isPending}
              >
                {completeLead.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Wyślij podsumowanie do doradcy
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="flex justify-center pt-6 pb-2">
              <div className="bg-primary/5 text-primary text-sm px-6 py-3 rounded-full font-medium shadow-sm border border-primary/10">
                Rozmowa została zakończona. Skontaktujemy się z Tobą.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pb-6 pt-10 px-4">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSend}
            className="flex items-end gap-2 bg-card p-2 rounded-3xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            <Input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 shrink-0 text-muted-foreground hover:text-primary transition-colors mb-0.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompleted || !conversationId}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Napisz wiadomość..."
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 min-h-[44px] h-auto resize-none py-3 text-[15px]"
              disabled={isCompleted || isTyping}
            />
            
            <Button 
              type="submit" 
              size="icon"
              className="rounded-full h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform active:scale-95 mb-0.5"
              disabled={!inputValue.trim() || isCompleted || isTyping}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase opacity-60">
              Enterprise IT Strategy Copilot
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
