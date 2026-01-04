
'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, User, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { FormattedResponse } from '@/components/formatted-response';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export const maxDuration = 60;

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isStreaming?: boolean;
};

export default function AssistantPage() {
  const { getTranslation, language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const translations = useMemo(() => ({
    title: { en: 'AI Health Assistant', am: 'የAI ጤና ረዳት', om: 'Gargaaraa Fayyaa AI' },
    welcome: { en: `Hi ${user?.displayName || 'there'}! How can I help you today?`, am: `ሰላም ${user?.displayName || ''}! ዛሬ እንዴት ልረዳዎት እችላለሁ?`, om: `Akkam ${user?.displayName || ''}! Har'a akkamittan si gargaaruu danda'a?` },
    placeholder: { en: 'Ask about symptoms, diet, and more...', am: 'ስለ ምልክቶች፣ አመጋገብ፣ እና ሌሎችም ይጠይቁ...', om: 'Waa\'ee mallattoolee, nyaataa fi kanneen biroo gaafadhu...' },
    error: { en: 'Sorry, I encountered an error. Please try again.', am: 'ይቅርታ፣ ስህተት አጋጥሞኛል። እባክዎ እንደገና ይሞክሩ።', om: 'Dhiifama, dogoggorri uumameera. Maaloo irra deebi\'ii yaali.' },
    demoResponse: { en: "Selam! I'm IDA. Ayizoh (Don't worry). I am here to help. How can I assist you today?", am: "ሰላም! እኔ IDA ነኝ። አይዞህ። ዛሬ እንዴት ልረዳህ እችላለሁ?", om: "Akkam! Ani IDA dha. Hin yaadda'in. Har'a akkamittan si gargaaruu danda'a?"}
  }), [language, user?.displayName]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: 'welcome', text: getTranslation(translations.welcome), sender: 'bot' }]);
    }
  }, [translations.welcome, getTranslation, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage: Message = { id: `user-${Date.now()}`, text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    const botMessageId = `bot-${Date.now()}`;
    setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot', isStreaming: true }]);
    
    // Simulate AI response for demo
    setTimeout(() => {
      const demoText = getTranslation(translations.demoResponse);
       setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: demoText, isStreaming: false } : msg
        )
      );
      setIsSending(false);
      textareaRef.current?.focus();
    }, 1200);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted/30 dark:bg-background">
      <header className="p-4 bg-background border-b z-10 sticky top-0">
        <h1 className="font-headline text-2xl font-bold text-center">{getTranslation(translations.title)}</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'bot' && (
                  <Avatar className="w-8 h-8 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="w-5 h-5"/>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground rounded-bl-none'
                  }`}
                >
                  {msg.isStreaming && msg.text.length === 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                      </div>
                  ) : (
                    <FormattedResponse text={msg.text} />
                  )}
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </main>

      <footer className="bg-background border-t p-2 sticky bottom-0">
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getTranslation(translations.placeholder)}
                className="flex-1 resize-none rounded-2xl border-2 pr-12 min-h-[44px] max-h-36"
                rows={1}
                disabled={isSending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-2 bottom-2 rounded-full w-9 h-9" 
                disabled={isSending || !input.trim()}
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <PaperAirplaneIcon className="h-5 w-5" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
        </div>
      </footer>
    </div>
  );
}
