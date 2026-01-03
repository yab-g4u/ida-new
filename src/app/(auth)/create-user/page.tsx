'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { Icons } from '@/components/icons';
import { useAuth } from '@/contexts/auth-provider';
import type { ClientUser } from '@/contexts/auth-provider';

function generateUniqueId() {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function CreateUserPage() {
  const router = useRouter();
  const { getTranslation } = useLanguage();
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = () => {
    if (!name.trim()) {
      return;
    }
    setIsLoading(true);

    const newUser: ClientUser = {
      uid: generateUniqueId(),
      displayName: name,
      isAnonymous: true,
    };

    try {
      localStorage.setItem('ida-user', JSON.stringify(newUser));
      setUser(newUser); // Update the auth context
    } catch (e) {
      console.error("Failed to save user to localStorage", e);
      setIsLoading(false);
      // Optionally show a toast to the user
      return;
    }
    
    // Redirect to home after a short delay to ensure context is updated
    setTimeout(() => {
        router.push('/home');
    }, 100);
  };
  
  const translations = {
      title: {en: "One Last Step", am: "አንድ የመጨረሻ ደረጃ", om: "Tarkaanfii Tokko Hafe"},
      description: {en: "What should we call you? This name will be used throughout the app.", am: "ምን እንበልዎት? ይህ ስም በመተግበሪያው ውስጥ በሙሉ ጥቅም ላይ ይውላል።", om: "Maqaan kee eenyu haa jennu? Maqaan kun appii guutuu keessatti ni fayyadama."},
      nameLabel: {en: "Your Name or Nickname", am: "የእርስዎ ስም ወይም ቅጽል ስም", om: "Maqaa Keessan yookiin Maqaa Moggaasaa"},
      continueButton: {en: "Continue", am: "ቀጥል", om: "Itti Fufi"},
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto w-fit mb-4">
                <Icons.logo className="h-16 w-16" />
            </div>
          <CardTitle className="text-2xl font-headline">{getTranslation(translations.title)}</CardTitle>
          <CardDescription>{getTranslation(translations.description)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{getTranslation(translations.nameLabel)}</Label>
            <Input
              id="name"
              type="text"
              placeholder={getTranslation({en: "e.g., Alex", am: "ለምሳሌ፣ አሌክስ", om: "Fkn, Aleksi"})}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateUser()}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleCreateUser} className="w-full" disabled={isLoading || !name.trim()}>
            {isLoading ? getTranslation({en: "Saving...", am: "በማስቀመጥ ላይ...", om: "Olkaa'amaa jira..."}) : getTranslation(translations.continueButton)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
