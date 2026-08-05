import { cn } from '@/lib/utils';
import { Message } from '@/hooks/use-chat';

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  if (isUser) {
    return (
      <div className="flex w-full mb-10 justify-end animate-in slide-in-from-bottom-2 fade-in duration-300" data-testid={`message-user-${message.id}`}>
        <div className="max-w-[85%] sm:max-w-[70%] bg-primary text-primary-foreground px-6 py-4 rounded-3xl rounded-tr-sm shadow-[0_4px_14px_rgb(0,0,0,0.05)]">
          <div className="text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full mb-12 justify-start animate-in slide-in-from-bottom-4 fade-in duration-500" data-testid={`message-assistant-${message.id}`}>
      <div className="flex-shrink-0 mr-5 sm:mr-6 mt-1 hidden sm:block">
        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-primary font-serif font-semibold text-lg shadow-sm border border-card-border">
          K
        </div>
      </div>
      
      <div className="max-w-[95%] sm:max-w-[85%] pt-1">
        <div className="flex items-center gap-3 mb-3 sm:hidden">
          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-primary font-serif font-semibold text-sm border border-card-border shadow-sm">
            K
          </div>
          <div className="text-xs font-medium text-muted-foreground font-serif tracking-wide uppercase">
            Konsultant
          </div>
        </div>
        <div className="hidden sm:block mb-3 text-sm font-medium text-muted-foreground font-serif tracking-wide uppercase">
          Konsultant
        </div>
        
        <div className="text-[16px] sm:text-[17px] text-foreground leading-relaxed whitespace-pre-wrap">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-primary/40 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
