'use client';

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { sponsoredPharmacies } from '@/lib/data';
import { Badge } from './ui/badge';
import { Clock, MapPin, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '@/hooks/use-language';


export function SponsoredCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )
  const { getTranslation } = useLanguage();

  React.useEffect(() => {
    if (!api) {
      return
    }
    setCurrent(api.selectedScrollSnap() + 1)
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setApi}
      >
        <CarouselContent>
          {sponsoredPharmacies.map((ad) => (
            <CarouselItem key={ad.id}>
              <Card className="bg-card border-primary/20 shadow-lg">
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                        <div className='flex items-center gap-3'>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{ad.name}</h3>
                                <p className="text-xs text-muted-foreground">{ad.slogan}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-primary text-primary">{getTranslation({en: "Featured", am: "ተለይቶ የቀረበ", om: "Filatame"})}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3"/>
                            <span>{ad.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3"/>
                             <span>{ad.hours}</span>
                        </div>
                    </div>
                  
                  <div className="text-center font-bold text-primary py-2 bg-accent rounded-lg">
                    {ad.offer}
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:text-white">
                    {getTranslation({en: "Visit Pharmacy", am: "ፋርማሲ ይጎብኙ", om: "Faarmaasii Daawwadhu"})}
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex justify-center gap-2 mt-3">
        {sponsoredPharmacies.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${current -1 === i ? 'w-6 bg-primary' : 'w-3 bg-muted'}`} />
        ))}
      </div>
    </div>
  )
}
