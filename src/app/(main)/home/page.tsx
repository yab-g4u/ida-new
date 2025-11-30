'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, MapPin, QrCode } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

const featureCards = [
    { 
        href: '/search-medicine', 
        icon: Search, 
        title: { en: 'Search Medicine Info', am: 'የመድሃኒት መረጃ ይፈልጉ', om: 'Odeeffannoo Qorichaa Barbaadi' },
        description: { en: 'Find information about your medication.', am: 'ስለ መድሃኒትዎ መረጃ ያግኙ።', om: 'Waa\'ee qoricha keetii odeeffannoo argadhu.' },
    },
    { 
        href: '/locate-pharmacy', 
        icon: MapPin, 
        title: { en: 'Locate Pharmacy', am: 'ፋርማሲ ያግኙ', om: 'Faarmaasii Barbaadi' },
        description: { en: 'Find pharmacies near you.', am: 'በአቅራቢያዎ ያሉ ፋርማሲዎችን ያግኙ።', om: 'Faarmaasiiwwan dhiyoo kee jiran argadhu.' },
    },
    { 
        href: '/my-qr-info', 
        icon: QrCode, 
        title: { en: 'My QR Info', am: 'የእኔ QR መረጃ', om: 'Odeeffannoo QR Koo' },
        description: { en: 'Your emergency health information.', am: 'የእርስዎ የድንገተኛ የጤና መረጃ።', om: 'Odeeffannoo kee kan fayyaa yeroo hatattamaa.' },
    },
];

export default function HomePage() {
  const { user } = useAuth();
  const { getTranslation } = useLanguage();
  
  const welcomeTitle = getTranslation({ en: 'Welcome to IDA', am: 'ወደ IDA እንኳን በደህና መጡ', om: 'Gara IDA tti Nagaan Dhuftan' });
  const welcomeSubtitle = user ? `ID: ${user.uid.substring(0, 8)}...` : getTranslation({ en: 'Your AI Health Ally', am: 'የእርስዎ AI የጤና አጋር', om: 'Gargaaraa Fayyaa AI Kee' });

  return (
    <div className="p-4 md:p-6 space-y-6 flex flex-col justify-center h-full">
      <header className="text-center">
        <h1 className="font-headline text-4xl text-primary-foreground">{welcomeTitle}</h1>
        <p className="text-muted-foreground">{welcomeSubtitle}</p>
      </header>
      
      <div className="flex-1 flex flex-col justify-center gap-4">
        {featureCards.map((feature, index) => (
            <Link href={feature.href} key={index} passHref>
                <Card className="hover:bg-accent transition-colors h-full">
                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                        <feature.icon className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle className="font-headline text-xl">{getTranslation(feature.title)}</CardTitle>
                            <CardDescription>{getTranslation(feature.description)}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}
