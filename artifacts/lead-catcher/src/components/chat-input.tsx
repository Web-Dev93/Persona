import { useState, useRef } from 'react';
import { Paperclip, ArrowUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string, file?: File | null) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if ((!content.trim() && !file) || disabled) return;
    onSend(content.trim(), file);
    setContent('');
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="relative w-full rounded-[2rem] bg-card border border-card-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
      {file && (
        <div className="flex items-center gap-2 px-6 pt-4 pb-1 text-sm text-muted-foreground" data-testid="attachment-preview">
          <Paperclip className="w-4 h-4 text-primary/60" />
          <span className="truncate max-w-[200px] font-medium text-foreground">{file.name}</span>
          <button 
            onClick={() => setFile(null)}
            className="p-1.5 hover:bg-muted rounded-full transition-colors ml-1 text-muted-foreground hover:text-foreground"
            type="button"
            title="Usuń załącznik"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      <div className="flex items-end px-3 py-3">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
          data-testid="file-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-3.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 rounded-full hover:bg-muted"
          type="button"
          title="Dołącz plik"
          data-testid="button-attach"
        >
          <Paperclip className="w-[1.125rem] h-[1.125rem]" />
        </button>
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Odpowiedz konsultantowi..."
          className="flex-1 max-h-[200px] min-h-[48px] py-3.5 px-3 bg-transparent border-none focus:outline-none resize-none placeholder:text-muted-foreground/60 text-foreground text-[16px] leading-relaxed"
          rows={1}
          data-testid="input-message"
        />
        
        <button
          onClick={handleSubmit}
          disabled={(!content.trim() && !file) || disabled}
          className="p-3 mb-[2px] mr-[2px] rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:scale-95 disabled:bg-muted disabled:text-muted-foreground transition-all hover:bg-primary/90 shadow-sm"
          type="button"
          title="Wyślij"
          data-testid="button-send"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
