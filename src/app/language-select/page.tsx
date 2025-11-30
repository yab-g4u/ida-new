'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo' },
];

export default function LanguageSelectPage() {
  const router = useRouter();
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
    try {
      localStorage.setItem('languageSelected', 'true');
    } catch (e) {
      console.warn('Could not save language selection to localStorage.');
    }
    router.push('/onboarding');
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <Icons.logo className="h-20 w-20" />
      <h1 className="mt-4 font-headline text-4xl font-bold text-primary-foreground">Welcome to IDA</h1>
      <p className="mt-2 text-lg text-muted-foreground">Please select your language.</p>

      <div className="mt-8 w-full max-w-sm space-y-4">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant="outline"
            size="lg"
            className="w-full justify-center text-lg py-6"
            onClick={() => handleLanguageSelect(lang.code)}
          >
            <span className="font-bold">{lang.nativeName}</span> ({lang.name})
          </Button>
        ))}
      </div>
    </div>
  );
}
