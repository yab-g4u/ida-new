'use client';

import { useState, useRef, useEffect, useMemo, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { aiHealthAssistant } from '@/ai/flows/ai-health-assistant';
import { Loader2, Send, Sparkles, BookText, HelpCircle, Activity, Heart, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { FormattedResponse } from '@/components/formatted-response';
import { useToast } from '@/hooks/use-toast';

export const maxDuration = 60; // Extend timeout to 60s

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  createdAt: any;
}

const commonQuestions = [
    { 
        icon: HelpCircle,
        question: { en: "What are the symptoms of the flu?", am: "የጉንፋን ምልክቶች ምንድናቸው?", om: "Mallattooleen utaalloo maali?" },
    },
    { 
        icon: Activity,
        question: { en: "How can I lower my blood pressure?", am: "የደም ግፊቴን እንዴት ዝቅ ማድረግ እችላለሁ?", om: "Dhiibbaa dhiigaa koo akkamittan gadi buusuu danda'a?" },
    },
    {
        icon: Heart,
        question: { en: "What are the benefits of a healthy diet?", am: "የጤናማ አመጋገብ ጥቅሞች ምንድ ናቸው?", om: "Faayidaan nyaata fayya qabeessa maali?" },
    },
];

export default function AssistantChatPage() {
  const { getTranslation, language } = useLanguage();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const chatId = params.chatId as string;

  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      createdAt: new Date(),
    };
    
    const botMessagePlaceholder: Message = {
      id: `bot-${Date.now()}`,
      text: '',
      sender: 'bot',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage, botMessagePlaceholder]);

    try {
      let finalBotMessageText = '';
      // Use the async generator directly
      const stream = aiHealthAssistant({ query: text, language });

      for await (const chunk of stream) {
        if (chunk.response) {
            finalBotMessageText += chunk.response;
            setMessages(prev => prev.map(msg => 
                msg.id === botMessagePlaceholder.id 
                ? { ...msg, text: finalBotMessageText }
                : msg
            ));
        }
      }

    } catch (error) {
        console.error("Error in handleSendMessage:", error);
        toast({
            variant: "destructive",
            title: getTranslation(translations.errorEncountered.title),
            description: getTranslation(translations.errorEncountered.description)
        });
        // Remove optimistic messages on error
        setMessages(prev => prev.filter(m => m.id !== userMessage.id && m.id !== botMessagePlaceholder.id));
    } finally {
        setIsLoading(false);
    }
  };

  const MainContent = useMemo(() => {
    if (!user) return null;
    const welcome = {
      title: { en: `Good Morning, ${user?.displayName || 'there'}`, am: `እንደምን አደሩ, ${user?.displayName || 'user'}`, om: `Akkam Bulte, ${user?.displayName || 'user'}`},
      subtitle: {en: 'How can I help you today?', am: 'ዛሬ እንዴት ልረዳዎት እችላለሁ?', om: 'Har\'a akkamittiin si gargaaruu danda\'a?'},
    };

    return (
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-3xl md:text-4xl font-headline text-foreground mb-2">
              {getTranslation(welcome.title)}
          </h1>
          <p className="text-muted-foreground mb-12">{getTranslation(welcome.subtitle)}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {commonQuestions.map((q, i) => {
                  const Icon = q.icon;
                  return (
                     <Card key={i} className="p-4 hover:bg-muted transition-colors text-left cursor-pointer" onClick={() => handleSendMessage(getTranslation(q.question))}>
                        <Icon className="h-6 w-6 text-primary mb-2"/>
                        <h3 className="font-semibold">{getTranslation(q.question)}</h3>
                    </Card>
                  )
              })}
          </div>
      </div>
    );
  }, [user, getTranslation]);

  const translations = useMemo(() => ({
    askMeAnythingPlaceholder: { en: 'Type a message...', am: 'መልዕክት ይተይቡ...', om: 'Ergaa barreessi...' },
    errorEncountered: { 
        title: { en: "Error", am: "ስህተት", om: "Dogoggora"},
        description: { en: 'Sorry, I encountered an error. Please try again.', am: 'ይቅርታ፣ ስህተት አጋጥሞኛል። እባክዎ እንደገና ይሞክሩ።', om: 'Dhiifama, dogoggoraatu mudate. Irra deebi\'ii yaali.' }
    },
    thinking: { en: 'Thinking...', am: 'እያሰበ ነው...', om: 'Yaadaa jira...' },
  }), [language]);

  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="relative w-full h-screen flex flex-col bg-background">
       <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-4 py-3 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">IDA Assistant</p>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1" viewportRef={viewportRef}>
          <div className="p-4 md:p-6 pb-24">
            {messages.length === 0 ? <div className='flex items-center justify-center h-full min-h-[calc(100vh-250px)]'>{MainContent}</div> :
            <div className="space-y-8 max-w-4xl mx-auto">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn('flex items-start gap-4 w-full', { 'justify-end': message.sender === 'user' })}
                    >
                    {message.sender === 'bot' && (
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            <AvatarFallback><Sparkles className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                    )}
                    
                    <div className={cn("max-w-[85%] rounded-2xl p-3 text-sm shadow-md", 
                        message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none'
                    )}>
                       {message.sender === 'bot' && message.text.length === 0 && isLoading ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                {getTranslation(translations.thinking)}
                            </div>
                       ) : (
                          <FormattedResponse text={message.text} />
                       )}
                    </div>

                    {message.sender === 'user' && (
                       <Avatar className="h-8 w-8">
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.sender === 'user' && (
                   <div className='flex items-start gap-4 w-full'>
                      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                          <AvatarFallback><Sparkles className="h-5 w-5"/></AvatarFallback>
                      </Avatar>
                      <div className={cn("max-w-[85%] rounded-2xl p-3 text-sm shadow-md", 'bg-card border rounded-bl-none')}>
                          <div className="flex items-center text-sm text-muted-foreground">
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              {getTranslation(translations.thinking)}
                          </div>
                      </div>
                   </div>
                )}
            </div>
            }
          </div>
      </ScrollArea>

      <footer className="fixed bottom-16 md:bottom-0 left-0 w-full p-4 bg-background/80 backdrop-blur-sm border-t">
        <div className="max-w-4xl mx-auto">
            <div className="relative rounded-xl border bg-muted focus-within:ring-2 focus-within:ring-ring">
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getTranslation(translations.askMeAnythingPlaceholder)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(input);
                    }
                }}
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-16 min-h-[56px] max-h-48 resize-none"
                rows={1}
            />
            <div className="absolute bottom-3 right-3 flex gap-1">
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
