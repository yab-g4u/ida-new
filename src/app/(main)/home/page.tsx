'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Search, MessageSquare, QrCode, Camera, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

const featureCards = [
    { 
        href: '/search-medicine', 
        icon: Search, 
        title: { en: 'Search Medicine', am: 'መድሃኒት ይፈልጉ', om: 'Qoricha Barbaadi' },
        description: { en: 'Find information about your medication.', am: 'ስለ መድሃኒትዎ መረጃ ያግኙ።', om: 'Waa\'ee qoricha keetii odeeffannoo argadhu.' },
    },
    { 
        href: '/assistant', 
        icon: MessageSquare, 
        title: { en: 'AI Health Assistant', am: 'AI የጤና ረዳት', om: 'Gargaaraa Fayyaa AI' },
        description: { en: 'Ask our AI for health advice.', am: 'ለጤና ምክር የእኛን AI ይጠይቁ።', om: 'Gorsa fayyaatiif AI keenya gaafadhu.' },
    },
    { 
        href: '/my-qr-info', 
        icon: QrCode, 
        title: { en: 'My QR Info', am: 'የእኔ QR መረጃ', om: 'Odeeffannoo QR Koo' },
        description: { en: 'Your emergency health information.', am: 'የእርስዎ የድንገተኛ የጤና መረጃ።', om: 'Odeeffannoo kee kan fayyaa yeroo hatattamaa.' },
    },
    { 
        href: '/scan-medicine', 
        icon: Camera, 
        title: { en: 'Scan Medicine', am: 'መድሃኒት ስካን ያድርጉ', om: 'Qoricha Iskaan Godhi' },
        description: { en: 'Identify meds with your camera.', am: 'በካሜራዎ መድሃኒቶችን ይለዩ።', om: 'Kaameraa keetiin qorichoota adda baasi.' },
    },
    { 
        href: '/locate-pharmacy', 
        icon: MapPin, 
        title: { en: 'Locate Pharmacy', am: 'ፋርማሲ ያግኙ', om: 'Faarmaasii Barbaadi' },
        description: { en: 'Find pharmacies near you.', am: 'በአቅራቢያዎ ያሉ ፋርማሲዎችን ያግኙ።', om: 'Faarmaasiiwwan dhiyoo kee jiran argadhu.' },
    },
];

export default function HomePage() {
  const { user } = useAuth();
  const { getTranslation } = useLanguage();
  
  const welcomeTitle = getTranslation({ en: 'Welcome to IDA', am: 'ወደ IDA እንኳን በደህና መጡ', om: 'Gara IDA tti Nagaan Dhuftan' });
  const welcomeSubtitle = user ? `ID: ${user.uid.substring(0, 8)}...` : getTranslation({ en: 'Your AI Health Ally', am: 'የእርስዎ AI የጤና አጋር', om: 'Gargaaraa Fayyaa AI Kee' });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="font-headline text-4xl text-primary-foreground">{welcomeTitle}</h1>
        <p className="text-muted-foreground">{welcomeSubtitle}</p>
      </header>

      <Card className="bg-accent">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{getTranslation({ en: 'Tip of the Day', am: 'የእለቱ ጠቃሚ ምክር', om: 'Qabxii Guyyaa' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{getTranslation({ en: 'Remember to drink at least 8 glasses of water a day to stay hydrated and healthy.', am: 'እርጥበት እና ጤናማ ለመሆን በቀን ቢያንስ 8 ብርጭቆ ውሃ መጠጣትን ያስታውሱ።', om: 'Qaama keessan jiidhina qabaachuufi fayyaalessa ta\'uuf guyyaatti yoo xiqqaate bishaan birciqqoo 8 dhuguu yaadadhaa.' })}</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featureCards.map((feature, index) => (
            <Link href={feature.href} key={index} passHref>
                <Card className="hover:bg-accent transition-colors h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <feature.icon className="w-8 h-8 text-primary" />
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
