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

export default function SearchMedicinePage() {
  const { getTranslation, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  
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
  };

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
            <InfoSection title="Drug Class" content={selectedDrug.classes} icon={Pill} language={language} translatingLabel={getTranslation(translations.translating)} />
            <InfoSection title="Common Usage" content={selectedDrug.usage} icon={Info} language={language} translatingLabel={getTranslation(translations.translating)} />
            <InfoSection title="Side Effects" content={selectedDrug.side_effects} icon={ShieldAlert} language={language} translatingLabel={getTranslation(translations.translating)} />
            <InfoSection title="Contraindications" content={selectedDrug.contraindications} icon={XCircle} language={language} translatingLabel={getTranslation(translations.translating)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { XCircle } from 'lucide-react';

function InfoSection({ title, content, icon: Icon, language, translatingLabel }: { title: string; content: string; icon?: React.ElementType, language: Language, translatingLabel: string }) {
  const [translatedTitle, setTranslatedTitle] = useState(title);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translate = async () => {
      if (language === 'en') {
        setTranslatedTitle(title);
        setTranslatedContent(content);
        return;
      }

      setIsTranslating(true);
      setTranslatedContent(null);
      
      try {
        const [titleRes, contentRes] = await Promise.all([
          translateText({ text: title, targetLanguage: language }),
          (!content || content.toLowerCase() === 'n/a') 
            ? Promise.resolve({ translatedText: content }) 
            : translateText({ text: content, targetLanguage: language })
        ]);
        setTranslatedTitle(titleRes.translatedText);
        setTranslatedContent(contentRes.translatedText);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedTitle(title);
        setTranslatedContent(content); // Fallback to original content
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [content, title, language]);

  if (!content || content.toLowerCase() === 'n/a') return null;

  return (
    <div className="flex items-start gap-4">
        {Icon && (
            <div className="p-2 bg-muted rounded-full mt-1">
                <Icon className="h-5 w-5 text-primary" />
            </div>
        )}
        <div className='flex-1'>
            {isTranslating ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{translatingLabel}...</span>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-foreground">{translatedTitle}</h3>
                <p className="text-sm text-muted-foreground">{translatedContent}</p>
              </>
            )}
        </div>
    </div>
  );
}
