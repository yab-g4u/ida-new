'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, X, Pill, Info, ShieldAlert } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getDrugData, searchDrugs, type Drug } from '@/lib/drug-data';
import { translateText } from '@/ai/flows/translate-text';

type TranslatedContent = {
    classes: string;
    usage: string;
    side_effects: string;
    contraindications: string;
}

export default function SearchMedicinePage() {
  const { getTranslation, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [translatedContent, setTranslatedContent] = useState<TranslatedContent | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  useEffect(() => {
    async function loadData() {
      await getDrugData();
      setIsDataLoading(false);
    }
    loadData();
  }, []);

  const handleSearch = (term: string) => {
    if (isDataLoading || term.length < 2) {
      setSearchResults([]);
      if(selectedDrug) handleClearSearch();
      return;
    }
    setIsSearching(true);
    const results = searchDrugs(term);
    setSearchResults(results.slice(0, 50)); // Limit results for performance
    setIsSearching(false);
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term);
  };

  const handleSelectDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setSearchTerm(drug.name);
    setSearchResults([]);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedDrug(null);
    setTranslatedContent(null);
  };

  useEffect(() => {
    if (selectedDrug && language !== 'en') {
      const translateContent = async () => {
        setIsTranslating(true);
        try {
          const [classes, usage, side_effects, contraindications] = await Promise.all([
            translateText({ text: selectedDrug.classes, targetLanguage: language }),
            translateText({ text: selectedDrug.usage, targetLanguage: language }),
            translateText({ text: selectedDrug.side_effects, targetLanguage: language }),
            translateText({ text: selectedDrug.contraindications, targetLanguage: language }),
          ]);
          setTranslatedContent({
            classes: classes.translatedText,
            usage: usage.translatedText,
            side_effects: side_effects.translatedText,
            contraindications: contraindications.translatedText,
          });
        } catch (error) {
          console.error("Translation failed:", error);
          // Fallback to English if translation fails
          setTranslatedContent({
            classes: selectedDrug.classes,
            usage: selectedDrug.usage,
            side_effects: selectedDrug.side_effects,
            contraindications: selectedDrug.contraindications,
          });
        } finally {
          setIsTranslating(false);
        }
      };
      translateContent();
    } else if (selectedDrug) {
      setTranslatedContent({
        classes: selectedDrug.classes,
        usage: selectedDrug.usage,
        side_effects: selectedDrug.side_effects,
        contraindications: selectedDrug.contraindications,
      });
    }
  }, [selectedDrug, language]);

  const translations = useMemo(() => ({
    title: { en: 'Search Medicine', am: 'መድሃኒት ይፈልጉ', om: 'Qoricha Barbaadi' },
    description: { en: 'Enter a medicine name to get information.', am: 'መረጃ ለማግኘት የመድሃኒት ስም ያስገቡ።', om: 'Odeeffannoo argachuuf maqaa qorichaa galchi.' },
    searchPlaceholder: { en: 'Type a medicine name...', am: 'የመድሃኒት ስም ይተይቡ...', om: 'Maqaa qorichaa barreessi...'},
    loadingDb: {en: 'Loading medicine database...', am: 'የመድሃኒት ዳታቤዝ በመጫን ላይ...', om: 'Kuusaa qorichaa galchaa jira...'},
    genericName: {en: 'Generic Name', am: 'አጠቃላይ ስም', om: 'Maqaa Waliigalaa'},
    drugClasses: {en: 'Drug Class', am: 'የመድሃኒት ክፍል', om: 'Gartuu Qorichaa'},
    usage: {en: 'Common Usage', am: 'የተለመደ አጠቃቀም', om: 'Fayyadama Waliigalaa'},
    dosage: {en: 'Dosage Forms', am: 'የመድሃኒት መጠን ቅጾች', om: 'Unkaawwan Hammii'},
    sideEffects: {en: 'Side Effects', am: 'የጎንዮሽ ጉዳቶች', om: 'Miidhaawwan Ciiqii'},
    contraindications: {en: 'Contraindications', am: 'የማይወሰድባቸው ሁኔታዎች', om: 'Haalawwan Hin Fudhatamne'},
    noResults: {en: 'No results found for', am: 'ምንም ውጤት አልተገኘም ለ', om: 'Bu\'aan argame hin jiru'},
    searchResults: {en: 'Search Results', am: 'የፍለጋ ውጤቶች', om: 'Bu\'aawwan Barbaacha'},
    translating: {en: 'Translating...', am: 'በመተርጎም ላይ...', om: 'Hiikamaa jira...'},
  }), [language]);

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
          onChange={handleSearchTermChange}
          disabled={isDataLoading}
          className="pl-10 text-lg h-12"
        />
        {isDataLoading && <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
        {searchTerm && (
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleClearSearch}>
                <X className="h-5 w-5 text-muted-foreground" />
            </Button>
        )}
      </div>

      {isDataLoading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin"/>
          <AlertTitle>{getTranslation(translations.loadingDb)}</AlertTitle>
        </Alert>
      )}

      {searchResults.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>{getTranslation(translations.searchResults)}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                     <div className="flex flex-col gap-1">
                        {searchResults.map((drug) => (
                          <button
                            key={drug.id}
                            onClick={() => handleSelectDrug(drug)}
                            className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors flex items-center gap-3"
                          >
                            <Pill className="h-5 w-5 text-primary" />
                            <span>{drug.name}</span>
                          </button>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}

      {searchTerm && searchResults.length === 0 && !selectedDrug && !isSearching && !isDataLoading &&(
         <Alert variant="destructive">
            <AlertTitle>{getTranslation(translations.noResults)} "{searchTerm}"</AlertTitle>
        </Alert>
      )}
      
      {selectedDrug && (
        <Card className='animate-in fade-in-50'>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{selectedDrug.name}</CardTitle>
            <CardDescription>{getTranslation(translations.genericName)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isTranslating ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{getTranslation(translations.translating)}</span>
              </div>
            ) : translatedContent ? (
              <>
                <InfoSection title={getTranslation(translations.drugClasses)} content={translatedContent.classes} icon={Pill} />
                <InfoSection title={getTranslation(translations.usage)} content={translatedContent.usage} icon={Info} />
                <InfoSection title={getTranslation(translations.sideEffects)} content={translatedContent.side_effects} icon={ShieldAlert} />
                <InfoSection title={getTranslation(translations.contraindications)} content={translatedContent.contraindications} icon={XCircle} />
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { XCircle } from 'lucide-react';

function InfoSection({ title, content, icon: Icon }: { title: string; content: string; icon?: React.ElementType }) {
  if (!content || content.toLowerCase() === 'n/a') return null;

  return (
    <div className="flex items-start gap-4">
        {Icon && (
            <div className="p-2 bg-muted rounded-full mt-1">
                <Icon className="h-5 w-5 text-primary" />
            </div>
        )}
        <div className='flex-1'>
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{content}</p>
        </div>
    </div>
  );
}
