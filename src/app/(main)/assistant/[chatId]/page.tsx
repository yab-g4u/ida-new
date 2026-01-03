'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { aiHealthAssistant } from '@/ai/flows/ai-health-assistant';
import { Loader2, Mic, Send, Sparkles, User, BookText, Search, MapPin, QrCode } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-provider';
import { useFirestore, useCollection } from '@/firebase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  citations?: string;
  createdAt: any;
}

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export default function AssistantChatPage() {
  const { getTranslation, language } = useLanguage();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesQuery = useMemo(() => (user?.uid && db && chatId !== 'new')
    ? query(
        collection(db, `users/${user.uid}/chats/${chatId}/messages`),
        orderBy('createdAt')
      )
    : null, [user?.uid, db, chatId]);
  
  const { data: messages, loading: messagesLoading } = useCollection(messagesQuery);

  const translations = useMemo(() => ({
    askAnything: { en: 'Ask our IDA anything', am: 'IDAን ማንኛውንም ነገር ይጠይቁ', om: 'IDA Gaaffii Kamiyyuu Gaafadhaa' },
    askMeAnythingPlaceholder: { en: 'Ask me anything...', am: 'ማንኛውንም ነገር ጠይቁኝ...', om: 'Gaaffii Kamiyyuu Na Gaafadhaa...' },
    errorEncountered: { en: 'Sorry, I encountered an error. Please try again.', am: 'ይቅርታ፣ ስህተት አጋጥሞኛል። እባክዎ እንደገና ይሞክሩ።', om: 'Dhiifama, dogoggoraatu mudate. Irra deebi\'ii yaali.' },
    you: { en: 'You', am: 'እርስዎ', om: 'Isin' },
    ida: { en: 'IDA', am: 'IDA', om: 'IDA' },
    thinking: { en: 'Thinking...', am: 'እያሰበ ነው...', om: 'Yaadaa jira...' },
    citations: { en: 'Citations:', am: 'ማጣቀሻዎች፡', om: 'Wabiiwwan:' },
    welcomeTitle: { en: `Good Morning, ${user?.displayName || 'there'}`, am: `እንደምን አደሩ, ${user?.displayName || 'user'}`, om: `Akkam Bulte, ${user?.displayName || 'user'}`},
    welcomeSubtitle: {en: 'How can I help you today?', am: 'ዛሬ እንዴት ልረዳዎት እችላለሁ?', om: 'Har\'a akkamittiin si gargaaruu danda\'a?'},
    searchMedicine: {en: 'Search Medicine Info', am: 'የመድሃኒት መረጃ ይፈልጉ', om: 'Odeeffannoo Qorichaa Barbaadi'},
    locatePharmacy: {en: 'Locate a Pharmacy', am: 'ፋርማሲ ያግኙ', om: 'Faarmaasii Barbaadi'},
    myQR: {en: 'View my QR Info', am: 'የእኔን QR መረጃ ይመልከቱ', om: 'Odeeffannoo QR Koo Ilaali'},
    listening: { en: 'Listening...', am: 'እየሰማሁ ነው...', om: 'Dhaggeeffachaa jira...'},
    micNotSupported: {en: 'Mic not supported', am: 'ማይክሮፎን አይደገፍም', om: 'Maayikiin hin deeggaramu'},
  }), [language, user?.displayName]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langMap = { en: 'en-US', am: 'am-ET', om: 'om-ET' };
    recognition.lang = langMap[language];

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [language]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        alert(getTranslation(translations.micNotSupported));
        return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };


  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user?.uid || !db) return;

    let currentChatId = chatId;
    const isNewChat = chatId === 'new';

    setInput('');
    
    setIsLoading(true);

    try {
      // 1. Create a new chat document if it's a new chat
      if (isNewChat) {
        const newChatRef = doc(collection(db, `users/${user.uid}/chats`));
        await setDoc(newChatRef, {
          title: getTranslation({ en: 'New Chat', am: 'አዲስ ውይይት', om: 'Haasaa Haaraa' }),
          createdAt: serverTimestamp(),
          userId: user.uid,
        });
        currentChatId = newChatRef.id;
        router.replace(`/assistant/${currentChatId}`);
      }

      const messagesRef = collection(db, `users/${user.uid}/chats/${currentChatId}/messages`);

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
        const chatDocRef = doc(db, `users/${user.uid}/chats/${currentChatId}`);
        const newTitle = text.substring(0, 40) + (text.length > 40 ? '...' : '');
        await updateDoc(chatDocRef, { title: newTitle });
      }

    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      if (currentChatId && currentChatId !== 'new') {
        const messagesRef = collection(db, `users/${user.uid}/chats/${currentChatId}/messages`);
        const errorMessage = {
          text: getTranslation(translations.errorEncountered),
          sender: 'bot',
          createdAt: serverTimestamp(),
        };
        await addDoc(messagesRef, errorMessage);
      }
    } finally {
        setIsLoading(false);
    }
  };
  
  const MainContent = () => (
    <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-3xl md:text-4xl font-headline text-foreground mb-2">
            {getTranslation(translations.welcomeTitle)}
        </h1>
        <p className="text-muted-foreground mb-12">{getTranslation(translations.welcomeSubtitle)}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Link href="/search-medicine" passHref>
                <Card className="p-4 hover:bg-muted transition-colors text-left">
                    <Search className="h-6 w-6 text-primary mb-2"/>
                    <h3 className="font-semibold">{getTranslation(translations.searchMedicine)}</h3>
                </Card>
            </Link>
             <Link href="/locate-pharmacy" passHref>
                <Card className="p-4 hover:bg-muted transition-colors text-left">
                    <MapPin className="h-6 w-6 text-primary mb-2"/>
                    <h3 className="font-semibold">{getTranslation(translations.locatePharmacy)}</h3>
                </Card>
            </Link>
             <Link href="/my-qr-info" passHref>
                <Card className="p-4 hover:bg-muted transition-colors text-left">
                    <QrCode className="h-6 w-6 text-primary mb-2"/>
                    <h3 className="font-semibold">{getTranslation(translations.myQR)}</h3>
                </Card>
            </Link>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 md:p-6">
            {messagesLoading && chatId !== 'new' ? 
              <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> :
              (!messages || messages.length === 0) ? <div className='flex items-center justify-center h-full'><MainContent /></div> :
            <div className="space-y-8 pb-24 max-w-4xl mx-auto">
                {(messages as Message[]).map((message) => (
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
                        <div className="whitespace-pre-wrap">
                            {message.text}
                        </div>
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

      <footer className="w-full p-4 bg-transparent border-t">
        <div className="max-w-4xl mx-auto">
            <div className="relative rounded-xl border bg-muted focus-within:ring-2 focus-within:ring-ring">
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? getTranslation(translations.listening) : getTranslation(translations.askMeAnythingPlaceholder)}
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
                <Button type="button" size="icon" variant={isRecording ? 'destructive' : 'ghost'} onClick={handleMicClick}>
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
