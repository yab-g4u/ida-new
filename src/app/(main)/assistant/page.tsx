'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { aiHealthAssistant } from '@/ai/flows/ai-health-assistant';
import { voiceInputForMedicationQueries } from '@/ai/flows/voice-input-medication-queries';
import { Loader2, Mic, Send, User, Bot, BookText, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    title: { en: 'Ask our IDA anything', am: 'IDAን ማንኛውንም ነገር ይጠይቁ', om: 'IDA Gaaffii Kamiyyuu Gaafadhaa' },
    suggestionsTitle: { en: 'Suggestions on what to ask IDA', am: 'IDAን ምን እንደሚጠይቁ ጥቆማዎች', om: 'IDA Gaaffiiwwan Akkamii Akka Gaafattan Yaada' },
    suggestion1: { en: 'What can I ask you to do?', am: 'ምን እንድሠራ ትፈልጋለህ?', om: 'Maal Akkan Siif Hojjedhu Barbaadda?' },
    suggestion2: { en: 'What medicine should I take for a headache?', am: 'ለራስ ምታት ምን ዓይነት መድኃኒት ልውሰድ?', om: 'Dhukkubbii Mataatiif Qoricha Akkamii Akkan Fudhadhu?' },
    suggestion3: { en: 'Where is the nearest pharmacy near me?', am: 'በአቅራቢያዬ ያለው ፋርማሲ የት ነው?', om: 'Faarmaasiin Naannoo Kootti Argamu Eessa?' },
    placeholder: { en: 'Ask me anything...', am: 'ማንኛውንም ነገር ጠይቁኝ...', om: 'Gaaffii Kamiyyuu Na Gaafadhaa...' },
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
    <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 text-center">
        <Sparkles className="h-10 w-10 text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-headline text-foreground mb-12">
            {getTranslation(translations.title)}
        </h1>

        <div className='w-full'>
            <p className="text-sm text-muted-foreground mb-4">{getTranslation(translations.suggestionsTitle)}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Button variant="outline" className="bg-background/50" onClick={() => handleSendMessage(getTranslation(translations.suggestion1))}>{getTranslation(translations.suggestion1)}</Button>
                <Button variant="outline" className="bg-background/50" onClick={() => handleSendMessage(getTranslation(translations.suggestion2))}>{getTranslation(translations.suggestion2)}</Button>
                <Button variant="outline" className="bg-background/50" onClick={() => handleSendMessage(getTranslation(translations.suggestion3))}>{getTranslation(translations.suggestion3)}</Button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full relative">
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at bottom, #E9D5FF 0%, transparent 60%)',
        }}
      ></div>

      <div className="flex-1 flex flex-col items-center w-full z-10">
        <ScrollArea className="w-full max-w-4xl flex-1 p-4" ref={scrollAreaRef}>
            {messages.length === 0 ? <div className='flex items-center justify-center h-full'><MainContent /></div> :
            <div className="space-y-8 pb-24">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn('flex items-start gap-4 w-full')}
                    >
                    <Avatar className={cn('h-8 w-8', message.sender === 'user' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                        <AvatarFallback>
                            {message.sender === 'user' ? <User className="h-5 w-5"/> : <Sparkles className="h-5 w-5"/>}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                        <p className="font-semibold text-foreground mb-1">{message.sender === 'user' ? 'You' : 'IDA'}</p>
                        <div className="text-foreground/90 whitespace-pre-wrap text-sm">
                            {message.text}
                        </div>
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
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback><Sparkles className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                         <p className="font-semibold text-foreground mb-1">IDA</p>
                        <div className="flex items-center text-sm">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Thinking...
                        </div>
                    </div>
                    </div>
                )}
            </div>
            }
        </ScrollArea>
      </div>

      <footer className="w-full p-4 fixed bottom-0 left-0 bg-transparent z-20">
        <div className="max-w-4xl mx-auto">
            <div className="relative rounded-xl border bg-background/80 backdrop-blur-sm shadow-lg focus-within:ring-2 focus-within:ring-ring">
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
                <Button type="button" size="icon" variant={isRecording ? 'destructive' : 'ghost'} onClick={handleVoiceInput} disabled={isLoading || !recognitionRef.current}>
                    <Mic className={cn('h-5 w-5', isRecording && 'animate-pulse')} />
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
