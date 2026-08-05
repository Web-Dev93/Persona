import { useState, useEffect } from 'react';
import { 
  useCreateAnthropicConversation, 
  useGetSessionByToken, 
  getGetSessionByTokenQueryKey, 
  useCompleteLead 
} from '@workspace/api-client-react';

export type Message = {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lead_session_token'));
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const createConv = useCreateAnthropicConversation();
  const completeLead = useCompleteLead();
  
  const { data: sessionData, isLoading: isSessionLoading } = useGetSessionByToken(token!, {
    query: {
      enabled: !!token,
      queryKey: token ? getGetSessionByTokenQueryKey(token) : ['no-token'],
      retry: false,
    }
  });

  useEffect(() => {
    if (sessionData) {
      setConversationId(sessionData.id);
      setMessages(sessionData.messages.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content
      })));
      if (sessionData.emailSent) {
        setIsComplete(true);
      }
    }
  }, [sessionData]);

  const sendMessage = async (content: string, file?: File | null) => {
    let currentConvId = conversationId;
    
    // Optimistic user message
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content }]);
    
    // Create conversation if none exists
    if (!currentConvId) {
      const newToken = Math.random().toString(36).substring(2, 15);
      try {
        const res = await createConv.mutateAsync({
          data: { title: 'Nowa rozmowa', sessionToken: newToken }
        });
        currentConvId = res.id;
        setConversationId(res.id);
        setToken(newToken);
        localStorage.setItem('lead_session_token', newToken);
      } catch (err) {
        console.error('Failed to create conversation', err);
        return;
      }
    }
    
    if (file) {
      const formData = new FormData();
      formData.append('conversationId', currentConvId.toString());
      formData.append('file', file);
      try {
        const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
        await fetch(`${BASE}/api/leads/upload`, { method: 'POST', body: formData });
      } catch (err) {
        console.error('File upload failed', err);
      }
    }
    
    setIsTyping(true);
    
    const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
    
    try {
      const response = await fetch(`${BASE}/api/anthropic/conversations/${currentConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      setIsTyping(false);
      
      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true }]);
      
      let fullContent = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.done) break;
              if (data.content) {
                fullContent += data.content;
                setMessages(prev => prev.map(m => 
                  m.id === assistantMsgId ? { ...m, content: fullContent } : m
                ));
              }
            } catch (e) {
              console.error('Failed to parse SSE line', dataStr, e);
            }
          }
        }
      }
      
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, isStreaming: false } : m
      ));
      
    } catch (err) {
      setIsTyping(false);
      console.error('Chat error:', err);
    }
  };

  const handleComplete = async () => {
    if (!conversationId) return;
    try {
      await completeLead.mutateAsync({ id: conversationId });
      setIsComplete(true);
    } catch (e) {
      console.error('Failed to complete lead', e);
    }
  };

  return {
    messages,
    sendMessage,
    isTyping,
    isSessionLoading,
    handleComplete,
    isComplete,
    showCompleteButton: messages.length >= 5 && !isComplete
  };
}
