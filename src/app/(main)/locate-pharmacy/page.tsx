
'use client';

import { useState } from 'react';
import { PharmacyMap } from '@/components/pharmacy-map';
import type { Pharmacy } from '@/components/pharmacy-map';
import { PharmacyInfoCard } from '@/components/pharmacy-info-card';
import { useLanguage } from '@/hooks/use-language';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { List, Loader2, LocateFixed, Map as MapIcon, MapPin, Search } from 'lucide-react';

type View = 'map' | 'list';

export default function LocatePharmacyPage() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [view, setView] = useState<View>('map');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { getTranslation } = useLanguage();

  const handleMarkerClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };
  
  const handleSheetClose = () => {
    setSelectedPharmacy(null);
  };

  const handleUseCurrentLocation = () => {
    // Placeholder for location logic
    setIsLoadingLocation(true);
    setTimeout(() => {
      // In a real app, you would get location and find nearest pharmacy
      setIsLoadingLocation(false);
    }, 1500);
  };

  const translations = {
    title: { en: 'Locate Pharmacy', am: 'ፋርማሲ ያግኝ', om: 'Faarmaasii Barbaadi' },
    subtitle: { en: 'Find pharmacies in your area in Addis Ababa', am: 'በአዲስ አበባ አካባቢዎ ያሉ ፋርማሲዎችን ያግኙ', om: 'Naannoo kee Addis Ababa keessatti faarmaasiiwwan argadhu' },
    searchPlaceholder: { en: 'Enter your area...', am: 'አካባቢዎን ያስገቡ...', om: 'Naannoo kee galchi...' },
    currentLocationBtn: { en: 'Use my current location', am: 'የአሁን አካባቢዬን ተጠቀም', om: 'Iddoo koo amma jirutti fayyadami' },
    mapView: { en: 'Map', am: 'ካርታ', om: 'Kaartaa' },
    listView: { en: 'List', am: 'ዝርዝር', om: 'Tarree' },
    loadingText: { en: 'Finding nearby pharmacies...', am: 'ቅርብ ፋርማሲዎችን በመፈለግ ላይ...', om: 'Faarmaasiiwwan dhihoo jiran barbaadaa jira...' },
    listNotAvailable: { en: 'List view is not yet available.', am: 'የዝርዝር እይታ እስካሁን አይገኝም።', om: 'Mul\'isni tarree ammaaf hin argamu.' },
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="p-4 md:p-6 bg-background border-b z-20">
        <div className="text-center md:text-left">
            <h1 className="font-headline text-3xl md:text-4xl text-primary-foreground">{getTranslation(translations.title)}</h1>
            <p className="text-muted-foreground">{getTranslation(translations.subtitle)}</p>
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
            
            <Button variant="outline" className="w-full" onClick={handleUseCurrentLocation} disabled={isLoadingLocation}>
                {isLoadingLocation ? (
                    <Loader2 className="h-5 w-5 animate-spin"/>
                ) : (
                    <LocateFixed className="h-5 w-5" />
                )}
                <span>{getTranslation(translations.currentLocationBtn)}</span>
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
                <Button variant={view === 'map' ? 'default' : 'outline'} onClick={() => setView('map')}>
                    <MapIcon />
                    <span>{getTranslation(translations.mapView)}</span>
                </Button>
                <Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')}>
                    <List />
                    <span>{getTranslation(translations.listView)}</span>
                </Button>
            </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {view === 'map' ? (
           <PharmacyMap onMarkerClick={handleMarkerClick} />
        ) : (
            <div className="flex items-center justify-center h-full text-center p-4">
                <p className="text-muted-foreground">{getTranslation(translations.listNotAvailable)}</p>
            </div>
        )}
        
        {isLoadingLocation && view === 'map' && (
             <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
                 <Loader2 className="h-12 w-12 text-primary animate-spin" />
                 <p className="mt-4 text-primary-foreground font-semibold">{getTranslation(translations.loadingText)}</p>
             </div>
        )}
      </main>

       <Sheet open={!!selectedPharmacy} onOpenChange={(open) => !open && handleSheetClose()}>
        <SheetContent side="bottom" className="h-auto md:h-1/3 p-4 rounded-t-lg">
            {selectedPharmacy && <PharmacyInfoCard pharmacy={selectedPharmacy} />}
        </SheetContent>
       </Sheet>
    </div>
  );
}
