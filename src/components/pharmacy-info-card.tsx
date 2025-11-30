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
    openNow: { en: 'Open now', am: 'አሁን ክፍት ነው', om: 'Amma Banaadha' },
    closesAt: { en: 'Closes at', am: 'የሚዘጋበት ሰዓት', om: 'Yoom Cufama' },
};

export function PharmacyInfoCard({ pharmacy }: PharmacyInfoCardProps) {
  const { getTranslation } = useLanguage();
  const { name, distance, phone, hours } = pharmacy;

  const handleDirectionsClick = () => {
    const [lat, lng] = pharmacy.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col justify-between h-full p-2">
      <div>
        <div className="flex justify-between items-start">
            <h2 className="font-headline text-2xl font-bold">{name}</h2>
            <Button onClick={handleDirectionsClick}>
                <Navigation className="mr-2" />
                {getTranslation(translations.directions)}
            </Button>
        </div>
        <Separator className="my-3" />
        <div className="space-y-2 text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="mr-2" />
            <span>{`${distance} km away`}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2" />
            <span>{hours === '24 Hours' ? getTranslation({en: 'Open 24 hours', am: '24 ሰዓት ክፍት', om: 'Sa\'aatii 24 Banaadha'}) : `${getTranslation(translations.closesAt)} ${hours}`}</span>
          </div>
          <div className="flex items-center">
            <Phone className="mr-2" />
            <span>{phone || getTranslation({ en: 'No phone number', am: 'ስልክ ቁጥር የለም', om: 'Lakkoofsi bilbilaa hin jiru' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
