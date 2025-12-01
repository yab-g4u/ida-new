'use client';

import { Languages } from 'lucide-react';
import { useLanguage, type Language } from '@/hooks/use-language';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';

const languages: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'am', name: 'አማርኛ' },
  { code: 'om', name: 'Afaan Oromoo' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Mobile View Trigger */}
        <div className="flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary cursor-pointer md:hidden">
            <Languages className="h-6 w-6" />
            <span className="text-xs font-medium">Language</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuTrigger asChild>
        {/* Desktop View Trigger */}
        <Button variant="ghost" size="icon" className="hidden md:inline-flex">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as Language)}>
          {languages.map((lang) => (
            <DropdownMenuRadioItem key={lang.code} value={lang.code}>
              {lang.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
