'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, X, Pill, Info, ShieldAlert, Sparkles, Utensils, Clock, Languages, AlertTriangle } from 'lucide-react';

// Mocked output since the AI flow is removed
type GetMedicineInfoOutput = {
  isMedicine: boolean;
  medicineName: string;
  whatItIs: string;
  usage: string;
  foodInstructions: string;
  timeTaken: string;
  sideEffects: string[];
  localSummaryAmharic: string;
  localSummaryOromo: string;
};

const mockDrugInfo: GetMedicineInfoOutput = {
    isMedicine: true,
    medicineName: "Paracetamol",
    whatItIs: "A common pain reliever and fever reducer.",
    usage: "Used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
    foodInstructions: "Can be taken with or without food. Take with food if it upsets your stomach.",
    timeTaken: "Typically taken every 4 to 6 hours as needed.",
    sideEffects: ["Nausea", "Stomach pain", "Loss of appetite", "Dark urine", "Clay-colored stools", "Jaundice (yellowing of the skin or eyes)"],
    localSummaryAmharic: "ፓራሲታሞል ለራስ ምታት፣ ለጡንቻ ህመም፣ እና ትኩሳት በሰፊው የሚያገለግል የተለመደ የህመም ማስታገሻ ነው።",
    localSummaryOromo: "Paaraasitaamool kan dhukkubbii mataa, dhukkubbii maashaa, fi ho'inaaf bal'inaan fayyadu qoricha dhukkubbii ittisuu beekamaadha."
};


export default function SearchMedicinePage() {
  const { getTranslation } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDrugInfo, setSelectedDrugInfo] = useState<GetMedicineInfoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);


  const handleSearch = async () => {
    if (searchTerm.length < 2) {
      setSelectedDrugInfo(null);
      setError(null);
      return;
    }
    setIsSearching(true);
    setSelectedDrugInfo(null);
    setError(null);

    // Simulate API call
    setTimeout(() => {
        if (searchTerm.toLowerCase().includes('para')) {
            setSelectedDrugInfo({...mockDrugInfo, medicineName: searchTerm});
        } else {
            setError(getTranslation(translations.notAMedicine));
        }
        setIsSearching(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedDrugInfo(null);
    setError(null);
  };

  const translations = useMemo(
    () => ({
      title: { en: 'Search Medicine', am: 'መድሃኒት ይፈልጉ', om: 'Qoricha Barbaadi' },
      description: {
        en: 'Enter a medicine name to get AI-powered information.',
        am: 'በAI የተደገፈ መረጃ ለማግኘት የመድሃኒት ስም ያስገቡ።',
        om: 'Odeeffannoo AI-tiin deeggarame argachuuf maqaa qorichaa galchi.',
      },
      searchPlaceholder: {
        en: 'Type a medicine name...',
        am: 'የመድሃኒት ስም ይተይቡ...',
        om: 'Maqaa qorichaa barreessi...',
      },
      searchButton: { en: 'Search', am: 'ፈልግ', om: 'Barbaadi' },
      notAMedicine: { en: 'This does not seem to be a valid medicine. Please try another name.', am: 'ይህ ትክክለኛ መድሃኒት አይመስልም። እባክዎ ሌላ ስም ይሞክሩ።', om: 'Kun qoricha sirrii fakkaatu miti. Maaloo maqaa biraa yaali.' },
      searchFailed: { en: 'An error occurred during the search. Please try again.', am: 'በፍለጋ ወቅት ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።', om: 'Yeroo barbaachaatti dogoggorri uumameera. Maaloo irra deebi\'ii yaali.' },
      disclaimer: { en: 'This is for informational purposes only. Always consult a doctor or pharmacist before taking any medication.', am: 'ይህ ለመረጃ አገልግሎት ብቻ ነው። ማንኛውንም መድሃኒት ከመውሰድዎ በፊት ሁል ጊዜ ሐኪም ወይም ፋርማሲስት ያማክሩ።', om: 'Kun odeeffannoof qofa. Qoricha kamiyyuu fudhachuu keessan dura yeroo hunda hakiima yookiin faarmaasii mariisisaa.' },
    }),
    [getTranslation]
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="font-headline text-4xl">{getTranslation(translations.title)}</h1>
        <p className="text-muted-foreground">{getTranslation(translations.description)}</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={getTranslation(translations.searchPlaceholder)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20 text-lg h-14"
        />
        {searchTerm && !isSearching && (
          <Button variant="ghost" size="icon" className="absolute right-16 top-1/2 -translate-y-1/2" onClick={handleClearSearch}>
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
         <Button onClick={handleSearch} disabled={isSearching} className="absolute right-2 top-1/2 -translate-y-1/2 h-10">
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : getTranslation(translations.searchButton)}
        </Button>
      </div>

      {isSearching && (
        <Card className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <Sparkles className="h-10 w-10 animate-pulse text-primary" />
          <p className="font-semibold text-muted-foreground">{getTranslation({en: 'AI is generating information for', am: 'AI መረጃ እያመነጨ ነው ለ', om: 'AI odeeffannoo uumaa jira'})} "{searchTerm}"...</p>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {selectedDrugInfo && (
        <DrugInfoDisplay drugInfo={selectedDrugInfo} disclaimer={getTranslation(translations.disclaimer)} />
      )}
    </div>
  );
}

function DrugInfoDisplay({ drugInfo, disclaimer }: { drugInfo: GetMedicineInfoOutput, disclaimer: string }) {
  const { whatItIs, usage, foodInstructions, timeTaken, sideEffects, localSummaryAmharic, localSummaryOromo } = drugInfo;

  const sections = [
    { title: 'What it is', content: whatItIs, icon: Pill, emoji: '💊' },
    { title: 'Usage', content: usage, icon: Info, emoji: '✅' },
    { title: 'Food Instructions', content: foodInstructions, icon: Utensils, emoji: '🍽️' },
    { title: 'Time Taken', content: timeTaken, icon: Clock, emoji: '⏱️' },
  ];

  return (
    <Card className='animate-in fade-in-50'>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="text-primary"/> AI-Generated Summary for "{drugInfo.medicineName}"
        </CardTitle>
        <CardDescription>Information generated by IDA Health Assistant.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, index) => (
            <InfoSection 
                key={index}
                title={`${section.emoji} ${section.title}`}
                content={section.content}
                icon={section.icon}
            />
        ))}

        <InfoSection 
            title={`⚠️ Side Effects`}
            content={
                <ul className='list-disc pl-5 space-y-1'>
                    {sideEffects.map((effect, i) => <li key={i}>{effect}</li>)}
                </ul>
            }
            icon={ShieldAlert}
        />
        
        <div className='p-4 bg-muted/50 rounded-lg space-y-4'>
            <InfoSection 
                title={`🌍 Local Translation`}
                content={
                    <div className='space-y-2'>
                        <p><span className='font-bold'>አማርኛ:</span> {localSummaryAmharic}</p>
                        <p><span className='font-bold'>Afaan Oromoo:</span> {localSummaryOromo}</p>
                    </div>
                }
                icon={Languages}
            />
        </div>
        
        <Alert variant="default" className="mt-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300">Disclaimer</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-500">
                {disclaimer}
            </AlertDescription>
        </Alert>

      </CardContent>
    </Card>
  )
}

function InfoSection({ title, content, icon: Icon }: { title: string; content: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-4">
        {Icon && (
            <div className="p-2 bg-muted rounded-full mt-1">
                <Icon className="h-5 w-5 text-primary" />
            </div>
        )}
        <div className='flex-1'>
            <h3 className="font-bold text-foreground text-lg">{title}</h3>
            <div className="text-md text-muted-foreground">{content}</div>
        </div>
    </div>
  );
}
