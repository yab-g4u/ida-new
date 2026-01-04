'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/hooks/use-language';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed, MapPin, Plus, Search } from 'lucide-react';
import type { CommunityPharmacy } from '@/lib/data';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SponsoredCarousel } from '@/components/sponsored-carousel';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<[number, number] | null>([9.0054, 38.7636]);
  const mapRef = useRef<{ flyTo: (coords: [number, number]) => void } | null>(null);

  const { getTranslation, language } = useLanguage();
  const { toast } = useToast();

  const [communityPharmacies, setCommunityPharmacies] = useState<CommunityPharmacy[]>([]);
  const [newPharmacy, setNewPharmacy] = useState({ name: '', comment: '' });
  const [newPharmacyCoords, setNewPharmacyCoords] = useState<[number, number] | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('communityPharmacies');
      if (stored) {
        setCommunityPharmacies(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read community pharmacies from localStorage");
    }
  }, []);

  const addCommunityPharmacy = useCallback((pharmacy: CommunityPharmacy) => {
    setCommunityPharmacies(prev => {
        const updatedList = [...prev, pharmacy];
        try {
            localStorage.setItem('communityPharmacies', JSON.stringify(updatedList));
        } catch (e) {
            console.warn("Could not save community pharmacy to localStorage");
        }
        return updatedList;
    });
  }, []);

  const handleGetUserLocation = (onSuccess: (coords: [number, number]) => void) => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onSuccess([latitude, longitude]);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({ variant: 'destructive', title: getTranslation(translations.locationErrorTitle), description: getTranslation(translations.locationErrorDesc) });
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast({ variant: 'destructive', title: getTranslation(translations.locationErrorTitle), description: getTranslation(translations.locationNotSupported) });
      setIsLoadingLocation(false);
    }
  };
  
  const handleFlyToUserLocation = () => {
    handleGetUserLocation((userCoords) => {
       setView(userCoords);
        if (mapRef.current) {
            mapRef.current.flyTo(userCoords);
        }
    });
  }

  const handleSetPharmacyLocation = () => {
    toast({ title: getTranslation({en: 'Tap on the map', am: 'ካርታው ላይ መታ ያድርጉ', om: 'Kaartaa irra tuqi'}) , description: getTranslation({en: 'Tap on the map to set the new pharmacy\'s location.', am: 'የአዲሱን ፋርማሲ ቦታ ለማዘጋጀት ካርታው ላይ መታ ያድርጉ።', om: 'Bakka faarmaasii haaraa qopheessuuf kaartaa irra tuqi.'}) });
  };

  const handleAddPharmacySubmit = () => {
    if (!newPharmacy.name.trim()) {
      toast({ variant: 'destructive', title: getTranslation(translations.validationError), description: getTranslation(translations.nameRequired) });
      return;
    }
    if (!newPharmacyCoords) {
      toast({ variant: 'destructive', title: getTranslation(translations.validationError), description: getTranslation(translations.locationRequired) });
      return;
    }
    
    setIsSubmitting(true);
    const newEntry: CommunityPharmacy = {
      id: Date.now(),
      name: newPharmacy.name,
      comment: newPharmacy.comment,
      coordinates: newPharmacyCoords,
      addedByUser: true,
    };
    
    addCommunityPharmacy(newEntry);
    
    setTimeout(() => {
        setIsSubmitting(false);
        setNewPharmacy({ name: '', comment: '' });
        setNewPharmacyCoords(null);
        setIsSheetOpen(false);
        toast({ title: getTranslation(translations.addSuccessTitle) });
    }, 500);
  };


  const translations = useMemo(() => ({
    title: { en: 'Locate Pharmacy', am: 'ፋርማሲ ያግኙ', om: 'Faarmaasii Barbaadi' },
    subtitle: { en: 'Find pharmacies in your area in Addis Ababa', am: 'በአዲስ አበባ አካባቢዎ ያሉ ፋርማሲዎችን ያግኙ', om: 'Naannoo kee Addis Ababa keessatti faarmaasiiwwan argadhu' },
    searchPlaceholder: { en: 'Enter your area...', am: 'አካባቢዎን ያስገቡ...', om: 'Naannoo kee galchi...' },
    currentLocationBtn: { en: 'Use my current location', am: 'የአሁን አካባቢዬን ተጠቀም', om: 'Iddoo koo amma jirutti fayyadami' },
    loadingText: { en: 'Finding nearby pharmacies...', am: 'ቅርብ ፋርማሲዎችን በመፈለግ ላይ...', om: 'Faarmaasiiwwan dhihoo jiran barbaadaa jira...' },
    sponsored: { en: 'Sponsored Pharmacies', am: 'ስፖንሰር የተደረጉ ፋርማሲዎች', om: 'Faarmaasiiwwan Deeggaraman' },
    addPharmacy: {en: 'Add Pharmacy', am: 'ፋርማሲ ጨምር', om: 'Faarmaasii Dabali'},
    addPharmacyDesc: {en: 'Help the community by adding a new pharmacy.', am: 'አዲስ ፋርማሲ በመጨመር ማህበረሰቡን ይርዱ።', om: 'Faarmaasii haaraa dabaluun hawaasa gargaari.'},
    pharmacyName: {en: 'Pharmacy Name', am: 'የፋርማሲ ስም', om: 'Maqaa Faarmaasii'},
    comment: {en: 'Comment (Optional)', am: 'አስተያየት (አማራጭ)', om: 'Yaada (Filannoo)'},
    commentPlaceholder: {en: 'e.g. "Open until 10 PM"', am: 'ለምሳሌ "እስከ 10 ሰዓት ክፍት ነው"', om: 'fkn. "Hanga 10 PMtti banaadha"'},
    setPharmacyLocation: {en: 'Tap on Map to Set Location', am: 'ቦታ ለማዘጋጀት ካርታው ላይ መታ ያድርጉ', om: 'Bakka Qopheessuuf Kaartaa irra Tuqi'},
    locationSetSuccess: {en: 'Location set!', am: 'አካባቢ ተቀናብሯል!', om: 'Bakki qindaa\'eera!'},
    submit: {en: 'Submit', am: 'አስገባ', om: 'Galchi'},
    locationErrorTitle: {en: 'Location Error', am: 'የአካባቢ ስህተት', om: 'Dogoggora Bakkaa'},
    locationErrorDesc: {en: 'Could not get your location. Please ensure location services are enabled.', am: 'አካባቢዎን ማግኘት አልተቻለም። እባክዎ የአካባቢ አገልግሎቶች መንቃታቸውን ያረጋгጡ።', om: 'Iddoo kee argachuu hin dandeenye. Maaloo tajaajilli iddoo argachuu akka banametti mirkaneessi.'},
    locationNotSupported: {en: 'Geolocation is not supported by this browser.', am: 'ጂኦሎኬሽን በዚህ አሳሽ አይደገፍም።', om: 'Geelookeeshiniin biraawzariin kun hin deeggaru.'},
    validationError: {en: 'Validation Error', am: 'የማረጋገጫ ስህተት', om: 'Dogoggora Mirkaneessuu'},
    nameRequired: {en: 'Pharmacy name is required.', am: 'የፋርማሲ ስም ያስፈልጋል።', om: 'Maqaan faarmaasii barbaachisaadha.'},
    locationRequired: {en: 'Pharmacy location is required.', am: 'የፋርማሲው ቦታ ያስፈልጋል።', om: 'Bakki faarmaasii barbaachisaadha.'},
    addSuccessTitle: {en: 'Pharmacy Added!', am: 'ፋርማሲ ተጨምሯል!', om: 'Faarmaasiin dabalameera!'},
    addedByCommunity: {en: 'Added by community', am: 'በማህበረሰብ የተጨመረ', om: 'Hawaasaan Dabalame'},
  }), [language, getTranslation]);

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="p-4 md:p-6 bg-background border-b z-20">
        <div className="text-center md:text-left">
            <h1 className="font-headline text-2xl md:text-3xl font-bold">{getTranslation(translations.title)}</h1>
            <p className="text-muted-foreground text-sm md:text-base">{getTranslation(translations.subtitle)}</p>
        </div>
        
        <div className="mt-4 md:flex md:gap-4 md:items-center space-y-3 md:space-y-0">
            <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder={getTranslation(translations.searchPlaceholder)}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 md:text-sm"
                />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                   <Search className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
            
            <Button variant="outline" className="w-full md:w-auto gap-2" onClick={handleFlyToUserLocation} disabled={isLoadingLocation}>
                {isLoadingLocation ? (
                    <Loader2 className="h-5 w-5 animate-spin"/>
                ) : (
                    <LocateFixed className="h-5 w-5" />
                )}
                <span className="text-sm">{getTranslation(translations.currentLocationBtn)}</span>
            </Button>
        </div>
        <div className='mt-6'>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{getTranslation(translations.sponsored)}</h2>
            <SponsoredCarousel />
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <PharmacyMap 
            initialView={view} 
            mapRef={mapRef} 
            communityPharmacies={communityPharmacies}
            onMapClick={(coords) => {
                if (isSheetOpen) {
                    setNewPharmacyCoords(coords);
                    toast({ title: getTranslation(translations.locationSetSuccess) });
                }
            }}
        />
        {isLoadingLocation && !isSubmitting && (
             <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20">
                 <Loader2 className="h-12 w-12 text-primary animate-spin" />
                 <p className="mt-4 text-foreground font-semibold">{getTranslation(translations.loadingText)}</p>
             </div>
        )}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                 <Button variant="default" size="icon" className="absolute bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-30">
                    <Plus className="w-6 h-6"/>
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl z-50">
                <SheetHeader className="text-left">
                    <SheetTitle>{getTranslation(translations.addPharmacy)}</SheetTitle>
                    <SheetDescription>{getTranslation(translations.addPharmacyDesc)}</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="pharmacy-name">{getTranslation(translations.pharmacyName)}</Label>
                        <Input id="pharmacy-name" value={newPharmacy.name} onChange={e => setNewPharmacy({...newPharmacy, name: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="comment">{getTranslation(translations.comment)}</Label>
                        <Textarea id="comment" placeholder={getTranslation(translations.commentPlaceholder)} value={newPharmacy.comment} onChange={e => setNewPharmacy({...newPharmacy, comment: e.target.value})} />
                    </div>
                    <Button variant={newPharmacyCoords ? "secondary" : "outline"} className="w-full gap-2" onClick={handleSetPharmacyLocation}>
                        <LocateFixed className="h-5 w-5" />
                        <span>{newPharmacyCoords ? getTranslation(translations.locationSetSuccess) : getTranslation(translations.setPharmacyLocation)}</span>
                    </Button>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">{getTranslation({en: 'Cancel', am: 'ሰርዝ', om: 'Haqi'})}</Button>
                    </SheetClose>
                    <Button onClick={handleAddPharmacySubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {getTranslation(translations.submit)}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}
