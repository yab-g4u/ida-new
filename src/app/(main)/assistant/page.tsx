'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { aiHealthAssistant } from '@/ai/flows/ai-health-assistant';
import { voiceInputForMedicationQueries } from '@/ai/flows/voice-input-medication-queries';
import { Loader2, Mic, Send, User, Bot, BookText, Sparkles, Languages } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { LanguageSwitcher } from '@/components/language-switcher';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  citations?: string;
}

export default function AssistantPage() {
  const { language, getTranslation, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceQuery(transcript);
      };
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      let langCode = 'en-US';
      if (language === 'am') langCode = 'am-ET';
      if (language === 'om') langCode = 'om-ET'; // Note: Oromo may not be fully supported by all browsers
      recognitionRef.current.lang = langCode;
    }
  }, [language]);

  const translations = {
    title: { en: 'IDA', am: 'IDA', om: 'IDA' },
    description: { en: 'Your AI Health Ally', am: 'የእርስዎ AI የጤና ረዳት', om: 'Gargaaraa Fayyaa AI Keessan' },
    placeholder: { en: 'Message IDA...', am: 'ለIDA መልዕክት ይላኩ...', om: 'IDA ergaa...' },
    hello: { en: 'Hello, how can I help you today?', am: 'ሰላም፣ ዛሬ እንዴት ልረዳዎት እችላለሁ?', om: 'Akkam, har\'a akkamittiin si gargaaruu danda\'aa?' },
  };

  const handleSendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

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
  
  const handleVoiceInput = () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.start();
    } else if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceQuery = async (query: string) => {
    if (!query.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), text: query, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const result = await voiceInputForMedicationQueries({ query, language });
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

  const MainContent = () => (
    <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4">
        <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-headline bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text font-bold">
                {getTranslation(translations.hello)}
            </h1>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">{getTranslation(translations.title)}</h1>
        </div>
        <LanguageSwitcher />
      </header>
      
      <div className="flex-1 flex flex-col items-center w-full">
        <ScrollArea className="w-full max-w-4xl flex-1 p-4" ref={scrollAreaRef}>
            {messages.length === 0 ? <MainContent /> :
            <div className="space-y-6">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={cn(
                        'flex items-start gap-4',
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                    >
                    {message.sender === 'bot' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Sparkles className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                    )}
                    <div className="max-w-xl">
                        <p className="font-semibold text-foreground mb-1">{message.sender === 'user' ? 'You' : 'IDA'}</p>
                        <div
                            className={cn(
                            'rounded-lg p-3 text-sm ',
                            message.sender === 'user'
                                ? 'bg-muted rounded-bl-none'
                                : 'bg-transparent'
                            )}
                        >
                            <p className="whitespace-pre-wrap">{message.text}</p>
                            {message.citations && (
                                <Alert className="mt-4 bg-background/50 border-accent">
                                    <BookText className="h-4 w-4"/>
                                    <AlertDescription className="text-xs">
                                        <strong>Citations:</strong> {message.citations}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>

                    {message.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4 justify-start">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Sparkles className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="max-w-xl">
                         <p className="font-semibold text-foreground mb-1">IDA</p>
                        <div className="bg-transparent rounded-lg p-3 flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                    </div>
                )}
            </div>
            }
        </ScrollArea>
      </div>

      <footer className="w-full p-4 border-t bg-background">
        <div className="max-w-4xl mx-auto">
            <div className="relative rounded-full border bg-muted focus-within:ring-2 focus-within:ring-ring">
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
                className="bg-transparent border-none rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 pr-24 min-h-[50px] max-h-48 resize-none"
                rows={1}
            />
            <div className="absolute bottom-2.5 right-3 flex gap-1">
                <Button type="button" size="icon" variant={isRecording ? 'destructive' : 'ghost'} onClick={handleVoiceInput} disabled={isLoading || !recognitionRef.current}>
                    <Mic className={cn('h-5 w-5', isRecording && 'animate-pulse')} />
                </Button>
                <Button type="submit" size="icon" onClick={() => handleSendMessage(input)} disabled={isLoading || !input.trim()}>
                    <Send className="h-5 w-5" />
                </Button>
            </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
