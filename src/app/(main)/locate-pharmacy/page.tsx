'use client';

import { useState } from 'react';
import { PharmacyMap } from '@/components/pharmacy-map';
import type { Pharmacy } from '@/components/pharmacy-map';
import { PharmacyInfoCard } from '@/components/pharmacy-info-card';
import { useLanguage } from '@/hooks/use-language';
import { Sheet, SheetContent } from '@/components/ui/sheet';


export default function LocatePharmacyPage() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const { getTranslation } = useLanguage();
  const title = getTranslation({
    en: 'Locate Pharmacy',
    am: 'ፋርማሲ ያግኙ',
    om: 'Faarmaasii Barbaadi',
  });

  const handleMarkerClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };
  
  const handleSheetClose = () => {
    setSelectedPharmacy(null);
  }

  return (
    <div className="relative h-full w-full">
       <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-background to-transparent z-10 text-center">
         <h1 className="font-headline text-4xl text-primary-foreground">{title}</h1>
       </div>
       <PharmacyMap onMarkerClick={handleMarkerClick} />
       <Sheet open={!!selectedPharmacy} onOpenChange={(open) => !open && handleSheetClose()}>
        <SheetContent side="bottom" className="h-1/3 p-4">
            {selectedPharmacy && <PharmacyInfoCard pharmacy={selectedPharmacy} />}
        </SheetContent>
       </Sheet>
    </div>
  );
}
