'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, MapPin, QrCode, ChevronRight, User, Settings, ShieldCheck, BrainCircuit, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

const featureCards = [
    { 
        href: '/search-medicine', 
        icon: Search, 
        iconBg: 'bg-green-100 dark:bg-green-900/50',
        iconColor: 'text-green-600 dark:text-green-400',
        title: { en: 'Search Medicine Info', am: 'መድሃኒት ፈልግ', om: 'Odeeffannoo Qorichaa Barbaadi' },
        description: { en: 'Find information about your medication.', am: 'ስለ መድሃኒትዎ መረጃ ያግኙ።', om: 'Waa\'ee qoricha keetii odeeffannoo argadhu.' },
    },
    { 
        href: '/locate-pharmacy', 
        icon: MapPin, 
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
        title: { en: 'Locate Pharmacy', am: 'ፋርማሲ ያግኙ', om: 'Faarmaasii Barbaadi' },
        description: { en: 'Find pharmacies near you.', am: 'በአቅራቢያዎ ያሉ ፋርማሲዎችን ያግኙ።', om: 'Faarmaasiiwwan dhiyoo kee jiran argadhu.' },
    },
    { 
        href: '/my-qr-info', 
        icon: QrCode, 
        iconBg: 'bg-purple-100 dark:bg-purple-900/50',
        iconColor: 'text-purple-600 dark:text-purple-400',
        title: { en: 'My QR Info', am: 'የእኔ QR መረጃ', om: 'Odeeffannoo QR Koo' },
        description: { en: 'Your emergency health information.', am: 'የእርስዎ የድንገተኛ የጤና መረጃ።', om: 'Odeeffannoo kee kan fayyaa yeroo hatattamaa.' },
    },
];

const smallFeatureCards = [
    {
        icon: Clock,
        label: { en: '24/7', am: '24/7', om: '24/7' },
    },
    {
        icon: BrainCircuit,
        label: { en: 'AI Powered', am: 'AI የተጎላበተ', om: 'AI-Aan Deeggarame' },
    },
    {
        icon: ShieldCheck,
        label: { en: 'Secure', am: 'ደህንነቱ የተጠበቀ', om: 'Nagaa\'aa' },
    }
];

export default function HomePage() {
  const { user } = useAuth();
  const { getTranslation, language } = useLanguage();
  
  const welcomeTitle = getTranslation({ en: `Welcome to IDA`, am: 'ወደ IDA እንኳን በደህና መጡ', om: 'Gara IDA tti Nagaan Dhuftan' });
  const welcomeSubtitle = getTranslation({ en: 'Your intelligent health assistant', am: 'ብልህ የጤና ረዳትዎ', om: 'Gargaaraa fayyaa kee oo\'annoo qabu' });

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold">{welcomeTitle}</h1>
                    <p className="text-sm opacity-90">{welcomeSubtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full hover:bg-white/20">
                        <User className="w-6 h-6" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/20">
                        <Settings className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
                {smallFeatureCards.map((feature, index) => (
                    <div key={index} className="bg-white/20 rounded-lg p-3 flex flex-col items-center justify-center">
                        <feature.icon className="w-7 h-7 mb-1"/>
                        <span className="text-xs font-semibold">{getTranslation(feature.label)}</span>
                    </div>
                ))}
            </div>
        </header>
      
        <main className="flex-grow p-4 md:p-6 space-y-4">
            <div className="space-y-4">
                {featureCards.map((feature, index) => (
                    <Link href={feature.href} key={index} passHref>
                        <div className="bg-card text-card-foreground rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 flex items-center">
                            <div className={`p-3 rounded-lg ${feature.iconBg} mr-4`}>
                                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                            </div>
                            <div className="flex-grow">
                                <h2 className="font-bold text-lg">{getTranslation(feature.title)}</h2>
                                <p className="text-sm text-muted-foreground">{getTranslation(feature.description)}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    </div>
  );
}
