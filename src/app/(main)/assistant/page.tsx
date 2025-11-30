'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { aiHealthAssistant } from '@/ai/flows/ai-health-assistant';
import { voiceInputForMedicationQueries } from '@/ai/flows/voice-input-medication-queries';
import { Loader2, Mic, Send, User, Bot, BookText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  citations?: string;
}

export default function AssistantPage() {
  const { language, getTranslation } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  const translations = {
    title: { en: 'AI Health Assistant', am: 'AI የጤና ረዳት', om: 'Gargaaraa Fayyaa AI' },
    description: { en: 'Ask me anything about your health.', am: 'ስለ ጤናዎ ማንኛውንም ነገር ይጠይቁኝ።', om: 'Waa\'ee fayyaa keetii waanuma fedhe na gaafadhu.' },
    placeholder: { en: 'Type your health question...', am: 'የጤና ጥያቄዎን ይተይቡ...', om: 'Gaaffii fayyaa kee barreessi...' },
    voiceQuery: {
      en: 'What should I do if I miss a dose of my medication?',
      am: 'የመድኃኒቴን ልክ መጠን ከረሳሁ ምን ማድረግ አለብኝ?',
      om: 'Yoo hamma qoricha koo hir\'ise maal gochuun qaba?',
    }
  };

  const handleSendMessage = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: query, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const result = await aiHealthAssistant({ query, language });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        sender: 'bot',
        citations: result.citations,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getTranslation({ en: 'Sorry, I encountered an error. Please try again.', am: 'ይቅርታ፣ ስህተት አጋጥሞኛል። እባክዎ እንደገና ይሞክሩ።', om: 'Dhiifama, dogoggoraatu mudate. Irra deebi\'ii yaali.' }),
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };
  
  const handleVoiceInput = async () => {
    const voiceQuery = getTranslation(translations.voiceQuery);
    const userMessage: Message = { id: Date.now().toString(), text: voiceQuery, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const result = await voiceInputForMedicationQueries({ query: voiceQuery, language });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
       const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getTranslation({ en: 'Sorry, I could not process the voice query.', am: 'ይቅርታ፣ የድምፅ ጥያቄውን ማስተናገድ አልቻልኩም።', om: 'Dhiifama, gaaffii sagaleen dhiyaateef deebii kennuu hin dandeenye.' }),
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <header className="text-center">
        <h1 className="font-headline text-4xl text-primary-foreground">{getTranslation(translations.title)}</h1>
        <p className="text-muted-foreground">{getTranslation(translations.description)}</p>
      </header>
      
      <ScrollArea className="flex-1 rounded-md border p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs rounded-lg p-3 text-sm md:max-w-md',
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.citations && (
                    <Alert className="mt-2 bg-background/50">
                        <BookText className="h-4 w-4"/>
                        <AlertDescription className="text-xs">
                            <strong>Citations:</strong> {message.citations}
                        </AlertDescription>
                    </Alert>
                )}
              </div>
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
               <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              <div className="bg-muted rounded-lg p-3 flex items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="relative">
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
          className="pr-24"
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          <Button type="button" size="icon" variant="ghost" onClick={handleVoiceInput} disabled={isLoading}>
            <Mic className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" onClick={() => handleSendMessage(input)} disabled={isLoading}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
