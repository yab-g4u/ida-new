'use client';

import { useState, useRef, useEffect, useMemo, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { aiHealthAssistant } from '@/ai/flows/ai-health-assistant';
import { Loader2, Send, Sparkles, BookText, HelpCircle, Activity, Heart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-provider';
import { useFirestore, useCollection } from '@/firebase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { FormattedResponse } from '@/components/formatted-response';
import { useToast } from '@/hooks/use-toast';

export const maxDuration = 60; // Extend timeout to 60s

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  citations?: string;
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
  const db = useFirestore();
  const params = useParams();
  const { toast } = useToast();
  const chatId = params.chatId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user?.uid || !db || chatId === 'new') {
        setMessages([]);
        setMessagesLoading(false);
        return;
    };
    setMessagesLoading(true);
    const q = query(collection(db, `users/${user.uid}/chats/${chatId}/messages`), orderBy('createdAt'));
    const snapshot = await getDocs(q);
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    setMessages(msgs);
    setMessagesLoading(false);
  };
  
  useEffect(() => {
    fetchMessages();
  }, [user, db, chatId]);


  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user?.uid || !db) return;

    let currentChatId = chatId;
    let isNewChat = chatId === 'new';

    setInput('');
    setIsLoading(true);
    
    // Optimistically add user message
    const userMessage: Message = {
      id: `local-user-${Date.now()}`,
      text,
      sender: 'user',
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Optimistically add bot placeholder
    const botMessagePlaceholder: Message = {
      id: `local-bot-${Date.now()}`,
      text: '',
      sender: 'bot',
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, botMessagePlaceholder]);


    try {
      if (isNewChat) {
        const newChatRef = doc(collection(db, `users/${user.uid}/chats`));
        await setDoc(newChatRef, {
          title: text.substring(0, 40) + (text.length > 40 ? '...' : ''),
          createdAt: serverTimestamp(),
          userId: user.uid,
        });
        currentChatId = newChatRef.id;
        isNewChat = false; // No longer a new chat
        window.history.replaceState(null, '', `/assistant/${currentChatId}`);
      }

      // Add user message to DB
      const userMessageForDb = { text, sender: 'user', createdAt: serverTimestamp() };
      await addDoc(collection(db, `users/${user.uid}/chats/${currentChatId}/messages`), userMessageForDb);
      
      const stream = await aiHealthAssistant({ query: text, language });
      
      for await (const chunk of stream) {
        setMessages(prev => prev.map(msg => 
            msg.id === botMessagePlaceholder.id 
            ? { ...msg, text: msg.text + chunk }
            : msg
        ));
      }

      const finalBotMessageText = messages.find(m => m.id === botMessagePlaceholder.id)?.text || '';

      const finalBotMessageForDb = {
        text: finalBotMessageText,
        sender: 'bot',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, `users/${user.uid}/chats/${currentChatId}/messages`), finalBotMessageForDb);
      
      // Remove local messages after DB is updated
      setMessages(prev => prev.filter(m => !m.id.startsWith('local-')));
      await fetchMessages(); // Refetch to get real IDs and timestamps

    } catch (error) {
        console.error("Error in handleSendMessage:", error);
        toast({
            variant: "destructive",
            title: getTranslation({en: "Error", am: "ስህተት", om: "Dogoggora"}),
            description: getTranslation(translations.errorEncountered)
        });
        // Remove optimistic messages on error
        setMessages(prev => prev.filter(m => m.id !== userMessage.id && m.id !== botMessagePlaceholder.id));
    } finally {
        setIsLoading(false);
    }
  };

  const MainContent = useMemo(() => {
    if (!user) return null;
    const translations = {
      welcomeTitle: { en: `Good Morning, ${user?.displayName || 'there'}`, am: `እንደምን አደሩ, ${user?.displayName || 'user'}`, om: `Akkam Bulte, ${user?.displayName || 'user'}`},
      welcomeSubtitle: {en: 'How can I help you today?', am: 'ዛሬ እንዴት ልረዳዎት እችላለሁ?', om: 'Har\'a akkamittiin si gargaaruu danda\'a?'},
    };

    return (
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-3xl md:text-4xl font-headline text-foreground mb-2">
              {getTranslation(translations.welcomeTitle)}
          </h1>
          <p className="text-muted-foreground mb-12">{getTranslation(translations.welcomeSubtitle)}</p>

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
    errorEncountered: { en: 'Sorry, I encountered an error. Please try again.', am: 'ይቅርታ፣ ስህተት አጋጥሞኛል። እባክዎ እንደገና ይሞክሩ።', om: 'Dhiifama, dogoggoraatu mudate. Irra deebi\'ii yaali.' },
    thinking: { en: 'Thinking...', am: 'እያሰበ ነው...', om: 'Yaadaa jira...' },
    citations: { en: 'Citations:', am: 'ማጣቀሻዎች፡', om: 'Wabiiwwan:' },
  }), [language]);

  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="relative w-full h-screen flex flex-col">
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
          <div className="p-4 md:p-6 pb-24">
            {messagesLoading && chatId !== 'new' ? 
              <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> :
              (!messages || messages.length === 0) ? <div className='flex items-center justify-center h-full min-h-[calc(100vh-200px)]'>{MainContent}</div> :
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
                    
                    <div className={cn("max-w-[75%] rounded-2xl p-3 text-sm", 
                        message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                    )}>
                       {message.id.startsWith('local-bot') && message.text.length === 0 ? (
                            <div className="flex items-center text-sm">
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
            </div>
            }
          </div>
      </ScrollArea>

      <footer className="fixed bottom-0 left-0 w-full p-4 bg-background/80 backdrop-blur-sm border-t pb-20">
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
