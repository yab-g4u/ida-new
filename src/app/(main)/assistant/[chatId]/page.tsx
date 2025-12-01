'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { aiHealthAssistant } from '@/ai/flows/ai-health-assistant';
import { Loader2, Mic, Send, Sparkles, User, BookText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-provider';
import { useFirestore, useCollection } from '@/firebase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, setDoc, updateDoc } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  citations?: string;
  createdAt: any;
}

export default function AssistantChatPage() {
  const { getTranslation, language } = useLanguage();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { userId } = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;

  const messagesQuery = useMemo(() => (userId && db && chatId !== 'new')
    ? query(
        collection(db, `users/${userId}/chats/${chatId}/messages`),
        orderBy('createdAt')
      )
    : null, [userId, db, chatId]);
  
  const { data: messages, loading: messagesLoading } = useCollection(messagesQuery);

  const translations = useMemo(() => ({
    askAnything: { en: 'Ask our IDA anything', am: 'IDAን ማንኛውንም ነገር ይጠይቁ', om: 'IDA Gaaffii Kamiyyuu Gaafadhaa' },
    askMeAnythingPlaceholder: { en: 'Ask me anything...', am: 'ማንኛውንም ነገር ጠይቁኝ...', om: 'Gaaffii Kamiyyuu Na Gaafadhaa...' },
    errorEncountered: { en: 'Sorry, I encountered an error. Please try again.', am: 'ይቅርታ፣ ስህተት አጋጥሞኛል። እባክዎ እንደገና ይሞክሩ።', om: 'Dhiifama, dogoggoraatu mudate. Irra deebi\'ii yaali.' },
    you: { en: 'You', am: 'እርስዎ', om: 'Isin' },
    ida: { en: 'IDA', am: 'IDA', om: 'IDA' },
    thinking: { en: 'Thinking...', am: 'እያሰበ ነው...', om: 'Yaadaa jira...' },
    citations: { en: 'Citations:', am: 'ማጣቀሻዎች፡', om: 'Wabiiwwan:' },
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
    if (!text.trim() || isLoading || !userId || !db) return;

    let currentChatId = chatId;
    const isNewChat = chatId === 'new';

    setInput('');
    setIsLoading(true);

    try {
      // 1. Create a new chat document if it's a new chat
      if (isNewChat) {
        const newChatRef = doc(collection(db, `users/${userId}/chats`));
        await setDoc(newChatRef, {
          title: getTranslation({ en: 'New Chat', am: 'አዲስ ውይይት', om: 'Haasaa Haaraa' }),
          createdAt: serverTimestamp(),
          userId: userId,
        });
        currentChatId = newChatRef.id;
        // Navigate immediately but replace to not add to history, the messages will appear as they are added
        router.replace(`/assistant/${currentChatId}`);
      }

      const messagesRef = collection(db, `users/${userId}/chats/${currentChatId}/messages`);

      // 2. Add user message to Firestore
      const userMessage = { text, sender: 'user', createdAt: serverTimestamp() };
      await addDoc(messagesRef, userMessage);
      
      // 3. Get AI response
      const result = await aiHealthAssistant({ query: text, language });
      const botMessage = {
        text: result.response,
        sender: 'bot',
        citations: result.citations,
        createdAt: serverTimestamp(),
      };
      await addDoc(messagesRef, botMessage);
      
      // 4. If it was a new chat, update the title based on the first interaction
      if (isNewChat) {
        const chatDocRef = doc(db, `users/${userId}/chats/${currentChatId}`);
        // For simplicity, we'll use the first 40 chars of the user's message as the title.
        // A more advanced version could call another AI flow to summarize.
        const newTitle = text.substring(0, 40) + (text.length > 40 ? '...' : '');
        await updateDoc(chatDocRef, { title: newTitle });
      }

    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      if (currentChatId && currentChatId !== 'new') {
        const messagesRef = collection(db, `users/${userId}/chats/${currentChatId}/messages`);
        const errorMessage = {
          text: getTranslation(translations.errorEncountered),
          sender: 'bot',
          createdAt: serverTimestamp(),
        };
        await addDoc(messagesRef, errorMessage);
      }
    }

    setIsLoading(false);
  };
  
  const MainContent = () => (
    <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 text-center">
        <Sparkles className="h-10 w-10 text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-headline text-foreground mb-12">
            {getTranslation(translations.askAnything)}
        </h1>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messagesLoading && chatId !== 'new' ? 
            <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> :
            (!messages || messages.length === 0) ? <div className='flex items-center justify-center h-full'><MainContent /></div> :
          <div className="space-y-8 pb-24 max-w-4xl mx-auto">
              {(messages as Message[]).map((message) => (
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
                      <p className="font-semibold text-foreground mb-1">{message.sender === 'user' ? getTranslation(translations.you) : getTranslation(translations.ida)}</p>
                      <div className="text-foreground/90 whitespace-pre-wrap text-sm">
                          {message.text}
                      </div>
                      {message.citations && (
                          <Alert className="mt-4 bg-background/50 border-accent">
                              <BookText className="h-4 w-4"/>
                              <AlertDescription className="text-xs">
                                  <strong>{getTranslation(translations.citations)}</strong> {message.citations}
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
                       <p className="font-semibold text-foreground mb-1">{getTranslation(translations.ida)}</p>
                      <div className="flex items-center text-sm">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          {getTranslation(translations.thinking)}
                      </div>
                  </div>
                  </div>
              )}
          </div>
          }
      </ScrollArea>

      <footer className="w-full p-4 bg-transparent">
        <div className="max-w-4xl mx-auto">
            <div className="relative rounded-xl border bg-card backdrop-blur-sm shadow-lg focus-within:ring-2 focus-within:ring-ring">
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
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-24 min-h-[56px] max-h-48 resize-none"
                rows={1}
            />
            <div className="absolute bottom-3 right-3 flex gap-1">
                <Button type="button" size="icon" variant='ghost' disabled={true}>
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