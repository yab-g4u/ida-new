'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, X, Pill, Info, ShieldAlert, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getDrugData, searchDrugs, type Drug } from '@/lib/drug-data';
import {
  translateMedicalBundle,
  type TranslateMedicalBundleOutput,
} from '@/ai/flows/translate-medical-bundle';

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
      if (selectedDrug) handleClearSearch();
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

  const translations = useMemo(
    () => ({
      title: { en: 'Search Medicine', am: 'መድሃኒት ይፈልጉ', om: 'Qoricha Barbaadi' },
      description: {
        en: 'Enter a medicine name to get information.',
        am: 'መረጃ ለማግኘት የመድሃኒት ስም ያስገቡ።',
        om: 'Odeeffannoo argachuuf maqaa qorichaa galchi.',
      },
      searchPlaceholder: {
        en: 'Type a medicine name...',
        am: 'የመድሃኒት ስም ይተይቡ...',
        om: 'Maqaa qorichaa barreessi...',
      },
      loadingDb: {
        en: 'Loading medicine database...',
        am: 'የመድሃኒት ዳታቤዝ በመጫን ላይ...',
        om: 'Kuusaa qorichaa galchaa jira...',
      },
      genericName: { en: 'Generic Name', am: 'አጠቃላይ ስም', om: 'Maqaa Waliigalaa' },
      drugClasses: { en: 'Drug Class', am: 'የመድሃኒት ክፍል', om: 'Gartuu Qorichaa' },
      usage: { en: 'Common Usage', am: 'የተለመደ አጠቃቀም', om: 'Fayyadama Waliigalaa' },
      dosage: { en: 'Dosage Forms', am: 'የመድሃኒት መጠን ቅጾች', om: 'Unkaawwan Hammii' },
      sideEffects: { en: 'Side Effects', am: 'የጎንዮሽ ጉዳቶች', om: 'Miidhaawwan Ciiqii' },
      contraindications: {
        en: 'Contraindications',
        am: 'የማይወሰድባቸው ሁኔታዎች',
        om: 'Haalawwan Hin Fudhatamne',
      },
      noResults: { en: 'No results found for', am: 'ምንም ውጤት አልተገኘም ለ', om: 'Bu\'aan argame hin jiru' },
      searchResults: { en: 'Search Results', am: 'የፍለጋ ውጤቶች', om: 'Bu\'aawwan Barbaacha' },
      translating: { en: 'Translating...', am: 'በመተርጎም ላይ...', om: 'Hiikamaa jira...' },
    }),
    [language]
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
          <Loader2 className="h-4 w-4 animate-spin" />
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
                {searchResults.map(drug => (
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

      {searchTerm && searchResults.length === 0 && !selectedDrug && !isSearching && !isDataLoading && (
        <Alert variant="destructive">
          <AlertTitle>
            {getTranslation(translations.noResults)} "{searchTerm}"
          </AlertTitle>
        </Alert>
      )}

      {selectedDrug && (
        <DrugInfoCard drug={selectedDrug} language={language} translations={translations} />
      )}
    </div>
  );
}

function DrugInfoCard({ drug, language, translations }: { drug: Drug, language: Language, translations: Record<string, any> }) {
  const [translatedInfo, setTranslatedInfo] = useState<TranslateMedicalBundleOutput['translatedSections'] | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const sections = useMemo(() => [
    { title: 'Drug Class', content: drug.classes, icon: Pill },
    { title: 'Common Usage', content: drug.usage, icon: Info },
    { title: 'Side Effects', content: drug.side_effects, icon: ShieldAlert },
    { title: 'Contraindications', content: drug.contraindications, icon: XCircle },
  ], [drug]);

  useEffect(() => {
    const translate = async () => {
      if (language === 'en') {
        const englishSections = sections.map(s => ({
          translatedTitle: translations[s.title.toLowerCase().replace(' ', '')] ? getTranslation(translations[s.title.toLowerCase().replace(' ', '')]) : s.title,
          translatedContent: s.content
        }));
        setTranslatedInfo(englishSections);
        return;
      }

      setIsTranslating(true);
      setTranslatedInfo(null);
      
      try {
        const sectionsToTranslate = sections
            .filter(s => s.content && s.content.toLowerCase() !== 'n/a')
            .map(s => ({ title: s.title, content: s.content }));

        if (sectionsToTranslate.length === 0) {
            setTranslatedInfo([]);
            return;
        }

        const result = await translateMedicalBundle({ 
            sections: sectionsToTranslate, 
            targetLanguage: language 
        });

        // Re-integrate the translated content with the original structure
        const finalInfo = sections.map(s => {
          const translatedSection = result.translatedSections.find(ts => {
            // This is a bit brittle, might need a better mapping strategy
            const originalSection = sectionsToTranslate.find(original => original.content === ts.translatedContent || original.title === ts.translatedTitle);
            return originalSection ? originalSection.title === s.title : false;
          });

          // Find translated title from the bundle
          const matchingOriginal = sectionsToTranslate.find(sec => sec.title === s.title);
          const translatedTitleObj = matchingOriginal ? result.translatedSections.find(res => res.translatedContent === matchingOriginal.content) : undefined;
          
          let translatedTitle = getTranslation(translations[s.title.toLowerCase().replace(/ /g, '')]) || s.title;
          const translatedItem = result.translatedSections.find(item => sectionsToTranslate.some(orig => orig.title === s.title && (item.translatedContent === orig.content || item.translatedTitle === orig.title)));

          if (translatedItem) {
             const originalIndex = sectionsToTranslate.findIndex(orig => orig.title === s.title);
             if (result.translatedSections[originalIndex]) {
                translatedTitle = result.translatedSections[originalIndex].translatedTitle;
             }
          }

          return {
            translatedTitle: translatedTitle,
            translatedContent: translatedSection ? translatedSection.translatedContent : s.content,
          };
        });
        
        // Let's create a map for easier lookup
        const translatedMap = new Map<string, { translatedTitle: string; translatedContent: string }>();
        result.translatedSections.forEach((translated, index) => {
            const original = sectionsToTranslate[index];
            if (original) {
                translatedMap.set(original.title, translated);
            }
        });

        const allSectionsInfo = sections.map(s => {
            if (s.content && s.content.toLowerCase() !== 'n/a' && translatedMap.has(s.title)) {
                const translated = translatedMap.get(s.title)!;
                return {
                    translatedTitle: translated.translatedTitle,
                    translatedContent: translated.translatedContent
                };
            }
            // Fallback for non-translated or N/A content
             return {
                translatedTitle: getTranslation({en: s.title, am: s.title, om: s.title}), // This will need a translation map
                translatedContent: s.content
            };
        });

        setTranslatedInfo(allSectionsInfo);


      } catch (error) {
        console.error('Translation failed:', error);
        // Fallback to english on error
        const fallbackSections = sections.map(s => ({ 
            translatedTitle: getTranslation(translations[s.title.toLowerCase().replace(' ', '')]) || s.title,
            translatedContent: s.content 
        }));
        setTranslatedInfo(fallbackSections);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [drug, language, sections, getTranslation, translations]);

  return (
    <Card className='animate-in fade-in-50'>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{drug.name}</CardTitle>
        <CardDescription>{getTranslation(translations.genericName)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isTranslating && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{getTranslation(translations.translating)}...</span>
          </div>
        )}
        {translatedInfo && sections.map((section, index) => {
          const translatedSection = translatedInfo[index];
          if (!translatedSection || !translatedSection.translatedContent || translatedSection.translatedContent.toLowerCase() === 'n/a') {
            return null;
          }
          return (
             <InfoSection 
                key={index}
                title={translatedSection.translatedTitle}
                content={translatedSection.translatedContent}
                icon={section.icon}
             />
          );
        })}
      </CardContent>
    </Card>
  )
}

function InfoSection({ title, content, icon: Icon }: { title: string; content: string; icon?: React.ElementType }) {
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
