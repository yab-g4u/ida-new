'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/hooks/use-language';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed, MapPin, Search } from 'lucide-react';

// Dynamically import the map component to prevent SSR issues
const PharmacyMap = dynamic(() => import('@/components/pharmacy-map').then((mod) => mod.PharmacyMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  ),
});


export default function LocatePharmacyPage() {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { getTranslation } = useLanguage();

  const handleUseCurrentLocation = () => {
    // This is a placeholder for leaflet to handle automatically
    setIsLoadingLocation(true);
    // This can trigger a re-center event on the map if implemented
    setTimeout(() => {
      setIsLoadingLocation(false);
    }, 1500);
  };

  const translations = useMemo(() => ({
    title: { en: 'Locate Pharmacy', am: 'ፋርማሲ ያግኙ', om: 'Faarmaasii Barbaadi' },
    subtitle: { en: 'Find pharmacies in your area in Addis Ababa', am: 'በአዲስ አበባ አካባቢዎ ያሉ ፋርማሲዎችን ያግኙ', om: 'Naannoo kee Addis Ababa keessatti faarmaasiiwwan argadhu' },
    searchPlaceholder: { en: 'Enter your area...', am: 'አካባቢዎን ያስገቡ...', om: 'Naannoo kee galchi...' },
    currentLocationBtn: { en: 'Use my current location', am: 'የአሁን አካባቢዬን ተጠቀም', om: 'Iddoo koo amma jirutti fayyadami' },
    loadingText: { en: 'Finding nearby pharmacies...', am: 'ቅርብ ፋርማሲዎችን በመፈለግ ላይ...', om: 'Faarmaasiiwwan dhihoo jiran barbaadaa jira...' },
  }), [getTranslation]);

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="p-4 md:p-6 bg-background border-b z-10">
        <div className="text-center md:text-left">
            <h1 className="font-headline text-2xl md:text-3xl font-bold">{getTranslation(translations.title)}</h1>
            <p className="text-muted-foreground text-sm md:text-base">{getTranslation(translations.subtitle)}</p>
        </div>
        
        <div className="mt-4 space-y-3">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder={getTranslation(translations.searchPlaceholder)}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                   <Search className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
            
            <Button variant="outline" className="w-full gap-2" onClick={handleUseCurrentLocation} disabled={isLoadingLocation}>
                {isLoadingLocation ? (
                    <Loader2 className="h-5 w-5 animate-spin"/>
                ) : (
                    <LocateFixed className="h-5 w-5" />
                )}
                <span>{getTranslation(translations.currentLocationBtn)}</span>
            </Button>
        </div>
      </header>

      <main className="flex-1 relative z-0">
        <PharmacyMap />
        {isLoadingLocation && (
             <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
                 <Loader2 className="h-12 w-12 text-primary animate-spin" />
                 <p className="mt-4 text-foreground font-semibold">{getTranslation(translations.loadingText)}</p>
             </div>
        )}
      </main>
    </div>
  );
}
