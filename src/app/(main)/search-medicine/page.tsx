'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { simplifyMedicationInstructions } from '@/ai/flows/simplify-medication-instructions';
import { medicineSearchChatbot, MedicineSearchChatbotInput } from '@/ai/flows/medicine-search-chatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMedicineData } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, Send, Mic, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-provider';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function SearchMedicinePage() {
  const { language, getTranslation } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('Amoxicillin');
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedInstructions, setSimplifiedInstructions] = useState('');
  const [error, setError] = useState('');
  
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isBotReplying, setIsBotReplying] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chatMessages]);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const cachedChat = localStorage.getItem('medicineChatHistory');
      if (cachedChat) {
        setChatMessages(JSON.parse(cachedChat));
      }
    } catch (e) {
      console.warn('Could not load chat history from localStorage');
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('medicineChatHistory', JSON.stringify(chatMessages));
    } catch (e) {
      console.warn('Could not save chat history to localStorage');
    }
  }, [chatMessages]);


  const handleSimplify = async () => {
    setIsSimplifying(true);
    setSimplifiedInstructions('');
    setError('');
    try {
      const result = await simplifyMedicationInstructions({
        instructions: mockMedicineData.complexInstructions[language],
        language: language,
      });
      setSimplifiedInstructions(result.simplifiedInstructions);
    } catch (e) {
      console.error(e);
      setError(getTranslation({ en: 'Failed to simplify instructions. Please try again.', am: 'መመሪያዎችን ማቃለል አልተቻለም። እባክዎ እንደገና ይሞክሩ።', om: 'Qajeelfama salphisuun hin danda\'amne. Irra deebi\'ii yaali.' }));
    }
    setIsSimplifying(false);
  };
  
  const handleSendChatMessage = useCallback(async () => {
    if (!chatInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user',
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsBotReplying(true);

    try {
      const botResponse = await medicineSearchChatbot({
        query: chatInput,
        language: language,
      });
      
      const newBotMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse.response,
        sender: 'bot',
      };
      setChatMessages(prev => [...prev, newBotMessage]);

    } catch (err) {
      console.error("Chatbot error:", err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getTranslation({en: "Sorry, I couldn't get a response. Please try again.", am: "ይቅርታ፣ ምላሽ ማግኘት አልቻልኩም። እባክዎ እንደገና ይሞክሩ።", om: "Dhiifama, deebii argachuu hin dandeenye. Irra deebi'ii yaali."}),
        sender: 'bot',
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBotReplying(false);
    }
  }, [chatInput, language, getTranslation]);

  const translations = {
    title: { en: 'Search Medicine', am: 'መድሃኒት ይፈልጉ', om: 'Qoricha Barbaadi' },
    description: { en: 'Enter a medicine name to get details and ask questions.', am: 'ዝርዝሮችን ለማግኘት እና ጥያቄዎችን ለመጠየቅ የመድሃኒት ስም ያስገቡ።', om: 'Tarreeffama argachuufii gaaffii gaafachuuf maqaa qorichaa galchi.' },
    searchPlaceholder: { en: 'e.g., Amoxicillin', am: 'ለምሳሌ፣ አሞክሲሲሊን', om: 'Fkn, Amoxicillin' },
    searchResultsFor: { en: 'Search Results for', am: 'የፍለጋ ውጤቶች ለ', om: 'Bu\'aawwan Barbaacha' },
    usage: { en: 'Usage', am: 'አጠቃቀም', om: 'Itti Fayyadama' },
    dosage: { en: 'Dosage', am: 'መጠን', om: 'Hamma' },
    sideEffects: { en: 'Side Effects', am: 'የጎንዮሽ ጉዳቶች', om: 'Miidhaawwan Ciiqii' },
    warnings: { en: 'Warnings', am: 'ማስጠንቀቂያዎች', om: 'Akeekkachiisoota' },
    complexInstructions: { en: 'Original Instructions', am: 'የመጀመሪያ መመሪያዎች', om: 'Qajeelfamoota Jalqabaa' },
    simplifyBtn: { en: 'Simplify Instructions', am: 'መመሪያዎችን አቅልል', om: 'Qajeelfama Salphisi' },
    simplifiedTitle: { en: 'Easy-to-Understand Instructions', am: 'ለመረዳት ቀላል የሆኑ መመሪያዎች', om: 'Qajeelfamoota Hubachuuf Salphaa' },
    chatbotTitle: { en: 'Ask IDA About This Medicine', am: 'ስለዚህ መድሃኒት IDAን ይጠይቁ', om: 'Waa\'ee Qoricha Kanaa IDA Gaafadhu'},
    chatbotPlaceholder: { en: 'Type your question...', am: 'ጥያቄዎን ይተይቡ...', om: 'Gaaffii kee barreessi...'},
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="font-headline text-4xl">{getTranslation(translations.title)}</h1>
        <p className="text-muted-foreground">{getTranslation(translations.description)}</p>
      </header>

      <div className="flex gap-2">
        <Input 
          placeholder={getTranslation(translations.searchPlaceholder)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button>{getTranslation({ en: 'Search', am: 'ፈልግ', om: 'Barbaadi' })}</Button>
      </div>
      
      {searchTerm.toLowerCase() === 'amoxicillin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{getTranslation(translations.searchResultsFor)} "{mockMedicineData.name}"</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoSection title={getTranslation(translations.usage)} content={getTranslation(mockMedicineData.usage)} />
              <InfoSection title={getTranslation(translations.dosage)} content={getTranslation(mockMedicineData.dosage)} />
              <InfoSection title={getTranslation(translations.sideEffects)} content={getTranslation(mockMedicineData.sideEffects)} />
              <InfoSection title={getTranslation(translations.warnings)} content={getTranslation(mockMedicineData.warnings)} />
              
              <div className="space-y-2">
                <h3 className="font-bold">{getTranslation(translations.complexInstructions)}</h3>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{getTranslation(mockMedicineData.complexInstructions)}</p>
              </div>
              
              <Button onClick={handleSimplify} disabled={isSimplifying} className="w-full">
                {isSimplifying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {getTranslation(translations.simplifyBtn)}
              </Button>
              
              {error && <Alert variant="destructive"><AlertTitle>{getTranslation({en: 'Error', am: 'ስህተት', om: 'Dogoggora' })}</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

              {simplifiedInstructions && (
                <Alert variant="default" className="bg-accent">
                  <Wand2 className="h-4 w-4" />
                  <AlertTitle className="font-headline">{getTranslation(translations.simplifiedTitle)}</AlertTitle>
                  <AlertDescription className="text-base text-foreground">
                    {simplifiedInstructions}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Chatbot UI */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{getTranslation(translations.chatbotTitle)}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col h-[500px]">
              <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
                <div className="space-y-4 pr-4">
                  {chatMessages.map((message) => (
                     <div
                        key={message.id}
                        className={cn('flex items-start gap-3 w-full', { 'justify-end': message.sender === 'user' })}
                    >
                      {message.sender === 'bot' && (
                          <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                              <AvatarFallback><Sparkles className="h-5 w-5"/></AvatarFallback>
                          </Avatar>
                      )}
                      <div className={cn("max-w-[80%] rounded-2xl p-3 text-sm", 
                          message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                      )}>
                          <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                      {message.sender === 'user' && (
                         <Avatar className="h-8 w-8">
                              <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                      )}
                    </div>
                  ))}
                   {isBotReplying && (
                    <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            <AvatarFallback><Sparkles className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                        <div className="flex items-center text-sm bg-muted p-3 rounded-2xl rounded-bl-none">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
              </ScrollArea>
              <div className="relative mt-auto">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChatMessage()}
                  placeholder={getTranslation(translations.chatbotPlaceholder)}
                  className="pr-20"
                />
                <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                  <Button type="button" size="icon" variant="ghost" disabled={isBotReplying}>
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={handleSendChatMessage} disabled={isBotReplying || !chatInput.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function InfoSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="space-y-1">
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{content}</p>
    </div>
  );
}
