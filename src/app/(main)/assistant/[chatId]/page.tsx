'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { FormattedResponse } from '@/components/formatted-response';

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
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;

  const messagesQuery = useMemo(() => (user?.uid && db && chatId !== 'new')
    ? query(
        collection(db, `users/${user.uid}/chats/${chatId}/messages`),
        orderBy('createdAt')
      )
    : null, [user?.uid, db, chatId]);
  
  const { data: firestoreMessages, loading: messagesLoading } = useCollection(messagesQuery);

  const messages = useMemo(() => {
    if (chatId === 'new') {
      return localMessages;
    }
    const combined = [...(firestoreMessages || [])];
    const localIds = new Set(combined.map(m => m.id));
    localMessages.forEach(lm => {
      if (!localIds.has(lm.id)) {
        combined.push(lm);
      }
    });
    return combined as Message[];
  }, [firestoreMessages, localMessages, chatId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user?.uid || !db) return;

    let currentChatId = chatId;
    const isNewChat = chatId === 'new';

    setInput('');
    setIsLoading(true);

    const userMessage: Message = {
      id: `local-${Date.now()}`,
      text,
      sender: 'user',
      createdAt: new Date(),
    };
    setLocalMessages(prev => [...prev, userMessage]);

    try {
      if (isNewChat) {
        const newChatRef = doc(collection(db, `users/${user.uid}/chats`));
        await setDoc(newChatRef, {
          title: getTranslation({ en: 'New Chat', am: 'አዲስ ውይይት', om: 'Haasaa Haaraa' }),
          createdAt: serverTimestamp(),
          userId: user.uid,
        });
        currentChatId = newChatRef.id;
        // Do not use router.replace here as it causes issues. The user will be on the new URL for the next message.
        // Let's update the window history to reflect the new chat ID without a full navigation.
        window.history.replaceState(null, '', `/assistant/${currentChatId}`);
      }

      const messagesRef = collection(db, `users/${user.uid}/chats/${currentChatId}/messages`);
      const userMessageForDb = { text, sender: 'user', createdAt: serverTimestamp() };
      await addDoc(messagesRef, userMessageForDb);
      
      const result = await aiHealthAssistant({ query: text, language });
      const botMessage = {
        text: result.response,
        sender: 'bot',
        citations: result.citations,
        createdAt: serverTimestamp(),
      };
      await addDoc(messagesRef, botMessage);
      
      if (isNewChat && currentChatId) {
        setLocalMessages([]); // Clear local messages as they will now come from firestore
        const chatDocRef = doc(db, `users/${user.uid}/chats/${currentChatId}`);
        const newTitle = text.substring(0, 40) + (text.length > 40 ? '...' : '');
        await updateDoc(chatDocRef, { title: newTitle });
      }

    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      const errorMessage: Message = {
        id: `local-error-${Date.now()}`,
        text: getTranslation(translations.errorEncountered),
        sender: 'bot',
        createdAt: new Date(),
      };
      setLocalMessages(prev => [...prev, errorMessage]);

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
                        {message.sender === 'bot' ? (
                          <FormattedResponse text={message.text} />
                        ) : (
                          <div className="whitespace-pre-wrap">{message.text}</div>
                        )}
                        {message.citations && (
                            <Alert className="mt-4 bg-background/50 border-accent text-xs">
                                <BookText className="h-4 w-4"/>
                                <AlertDescription>
                                    <strong>{getTranslation(translations.citations)}</strong> {message.citations}
                                </AlertDescription>
                            </Alert>
                        )}
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
                            <AvatarFallback><Sparkles className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                        <div className="flex items-center text-sm bg-muted p-3 rounded-2xl rounded-bl-none">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            {getTranslation(translations.thinking)}
                        </div>
                    </div>
                )}
            </div>
            }
          </div>
      </ScrollArea>

      <footer className="w-full p-4 bg-background/80 backdrop-blur-sm border-t pb-20">
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
