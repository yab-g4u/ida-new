
'use client';

import type { Pharmacy } from './pharmacy-map';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Phone, MapPin, Clock, Navigation } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface PharmacyInfoCardProps {
  pharmacy: Pharmacy;
}

const translations = {
    directions: { en: 'Directions', am: 'አቅጣጫዎች', om: 'Kallattiiwwan' },
    call: { en: 'Call', am: 'ይደውሉ', om: 'Bilbili' },
    openNow: { en: 'Open now', am: 'አሁን ክፍት ነው', om: 'Amma Banaadha' },
    closesAt: { en: 'Closes at', am: 'የሚዘጋበት ሰዓት', om: 'Yoom Cufama' },
};

export function PharmacyInfoCard({ pharmacy }: PharmacyInfoCardProps) {
  const { getTranslation } = useLanguage();
  const { name, distance, phone, hours, area } = pharmacy;

  const handleDirectionsClick = () => {
    const [lat, lng] = pharmacy.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col justify-between h-full p-2">
      <div>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <h2 className="font-headline text-xl md:text-2xl font-bold">{name}</h2>
                <p className="text-muted-foreground text-sm">{area}</p>
            </div>
            <div className='flex gap-2'>
                {phone && (
                    <Button asChild variant="outline" size="icon">
                        <a href={`tel:${phone}`}><Phone /></a>
                    </Button>
                )}
                <Button onClick={handleDirectionsClick} size="icon">
                    <Navigation />
                </Button>
            </div>
        </div>
        <Separator className="my-3" />
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{`${distance} km away`}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>{hours === '24 Hours' ? getTranslation({en: 'Open 24 hours', am: '24 ሰዓት ክፍት', om: 'Sa\'aatii 24 Banaadha'}) : `${getTranslation(translations.closesAt)} ${hours}`}</span>
          </div>
          {phone && (
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
