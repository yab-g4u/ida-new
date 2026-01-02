'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { aiHealthAssistant } from '@/ai/flows/ai-health-assistant';
import { Loader2, Mic, Send, Sparkles, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import Prism from '@/components/ui/Prism';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  citations?: string;
}

export default function AssistantPage() {
  const { getTranslation, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const translations = useMemo(() => ({
    title: { en: 'Ask IDA anything', am: 'IDAን ማንኛውንም ነገር ይጠይቁ', om: 'IDA Gaaffii Kamiyyuu Gaafadhaa' },
    placeholder: { en: 'Ask me anything about your health...', am: 'ስለ ጤናዎ ማንኛውንም ነገር ይጠይቁኝ...', om: 'Waa\'ee fayyaa keetii gaaffii kamiyyuu na gaafadhu...' },
    suggestion1: { en: 'What are the symptoms of the flu?', am: 'የጉንፋን ምልክቶች ምንድ ናቸው?', om: 'Mallattooleen utaalloo maali?' },
    suggestion2: { en: 'How can I relieve a headache?', am: 'የራስ ምታትን እንዴት ማስታገስ እችላለሁ?', om: 'Mataa dhukkubbii akkamittiin hir\'isuu danda\'a?' },
    suggestion3: { en: 'Tell me about intermittent fasting', am: 'ስለ ጊዜያዊ ጾም ንገረኝ', om: 'Waa\'ee sooma yeroo yerootiin naaf himi' },
    error: { en: 'Sorry, I encountered an error.', am: 'ይቅርታ፣ ስህተት አጋጥሞኛል።', om: 'Dhiifama, dogoggorri uumame.' },
    thinking: { en: 'Thinking...', am: 'እያሰብኩ ነው...', om: 'Yaadaa jira...' },
  }), [language]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await aiHealthAssistant({ query: text, language });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        sender: 'bot',
        citations: result.citations,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getTranslation(translations.error),
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <Sparkles className="h-12 w-12 text-muted-foreground" />
      <h1 className="mt-4 font-headline text-4xl font-bold text-foreground">
        {getTranslation(translations.title)}
      </h1>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-4xl">
        {[translations.suggestion1, translations.suggestion2, translations.suggestion3].map((suggestion, i) => (
           <button key={i} onClick={() => handleSendMessage(getTranslation(suggestion))} className="p-4 bg-muted/80 rounded-lg text-left text-sm hover:bg-muted transition-colors">
              {getTranslation(suggestion)}
           </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Prism transparent={false} opacity={0.4} />
      </div>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 md:p-6">
          {messages.length === 0 ? <WelcomeScreen /> : (
            <div className="space-y-8 pb-24 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex items-start gap-4 w-full', { 'justify-end': message.sender === 'user' })}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback><Sparkles className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn("max-w-[75%] rounded-2xl p-3 text-sm", 
                      message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                  )}>
                    <div className="whitespace-pre-wrap">{message.text}</div>
                  </div>

                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Sparkles className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  <div className="flex items-center text-sm bg-muted p-3 rounded-2xl rounded-bl-none">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {getTranslation(translations.thinking)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <footer className="w-full p-4 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-xl border bg-card focus-within:ring-2 focus-within:ring-ring">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getTranslation(translations.placeholder)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-24 min-h-[56px] max-h-48 resize-none"
              rows={1}
            />
            <div className="absolute bottom-3 right-3 flex gap-1">
              <Button type="button" size="icon" variant='ghost'>
                <Mic className="h-5 w-5" />
              </Button>
              <Button type="submit" size="icon" variant="ghost" onClick={() => handleSendMessage(input)} disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
