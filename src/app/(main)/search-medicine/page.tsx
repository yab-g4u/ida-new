'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { simplifyMedicationInstructions } from '@/ai/flows/simplify-medication-instructions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMedicineData } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2 } from 'lucide-react';

export default function SearchMedicinePage() {
  const { language, getTranslation } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('Amoxicillin');
  const [isLoading, setIsLoading] = useState(false);
  const [simplifiedInstructions, setSimplifiedInstructions] = useState('');
  const [error, setError] = useState('');

  const handleSimplify = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  };
  
  const translations = {
    title: { en: 'Search Medicine', am: 'መድሃኒት ይፈልጉ', om: 'Qoricha Barbaadi' },
    description: { en: 'Enter a medicine name to get details.', am: 'ዝርዝሮችን ለማግኘት የመድሃኒት ስም ያስገቡ።', om: 'Tarreeffama argachuuf maqaa qorichaa galchi.' },
    searchPlaceholder: { en: 'e.g., Amoxicillin', am: 'ለምሳሌ፣ አሞክሲሲሊን', om: 'Fkn, Amoxicillin' },
    searchResultsFor: { en: 'Search Results for', am: 'የፍለጋ ውጤቶች ለ', om: 'Bu\'aawwan Barbaacha' },
    usage: { en: 'Usage', am: 'አጠቃቀም', om: 'Itti Fayyadama' },
    dosage: { en: 'Dosage', am: 'መጠን', om: 'Hamma' },
    sideEffects: { en: 'Side Effects', am: 'የጎንዮሽ ጉዳቶች', om: 'Miidhaawwan Ciiqii' },
    warnings: { en: 'Warnings', am: 'ማስጠንቀቂያዎች', om: 'Akeekkachiisoota' },
    complexInstructions: { en: 'Original Instructions', am: 'የመጀመሪያ መመሪያዎች', om: 'Qajeelfamoota Jalqabaa' },
    simplifyBtn: { en: 'Simplify Instructions', am: 'መመሪያዎችን አቅልል', om: 'Qajeelfama Salphisi' },
    simplifiedTitle: { en: 'Easy-to-Understand Instructions', am: 'ለመረዳት ቀላል የሆኑ መመሪያዎች', om: 'Qajeelfamoota Hubachuuf Salphaa' },
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="font-headline text-4xl text-primary-foreground">{getTranslation(translations.title)}</h1>
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
            
            <Button onClick={handleSimplify} disabled={isLoading} className="w-full">
              {isLoading ? (
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
