'use client';

import Image from 'next/image';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { Icons } from './icons';

const onboardingSteps = [
  {
    id: 'onboarding1',
    title: {
      en: 'Instant Learning',
      am: 'ፈጣን ትምህርት',
      om: 'Barnoota Saffisaa',
    },
    description: {
      en: 'Search for medications and get easy-to-understand health information.',
      am: 'መድሃኒቶችን ይፈልጉ እና ለመረዳት ቀላል የሆነ የጤና መረጃ ያግኙ።',
      om: 'Qorichoota barbaadi, odeeffannoo fayyaa salphaatti hubatamu argadhu.',
    },
  },
  {
    id: 'onboarding2',
    title: {
      en: 'Scan & Translate',
      am: 'ስካን እና መተርጎም',
      om: 'Iskaan Godhii Hiiki',
    },
    description: {
      en: 'Quickly identify medicines from their packaging.',
      am: 'መድሃኒቶችን ከማሸጊያቸው በፍጥነት ይለዩ።',
      om: 'Qorichoota paakeejii isaaniirraa saffisaan adda baasi.',
    },
  },
  {
    id: 'onboarding3',
    title: {
      en: 'Find Nearby Help',
      am: 'አቅራቢያዎ ያለ እርዳታ ያግኙ',
      om: 'Gargaarsa Dhiyoo Jiru Barbaadi',
    },
    description: {
      en: 'Locate pharmacies and health centers near you.',
      am: 'በአቅራቢያዎ ያሉ ፋርማሲዎችን እና የጤና ጣቢያዎችን ያግኙ።',
      om: 'Faarmaasiiwwaniifi wiirtuuwwan fayyaa dhiyoo kee jiran argadhu.',
    },
  },
  {
    id: 'onboarding4',
    title: {
      en: 'Emergency QR Ready',
      am: 'ለድንገተኛ አደጋ QR ዝግጁ',
      om: 'QR Ariifachiisaaf Qophaa’aa',
    },
    description: {
      en: 'Your vital health info, ready for any emergency.',
      am: 'የእርስዎ ወሳኝ የጤና መረጃ፣ ለማንኛውም ድንገተኛ አደጋ ዝግጁ።',
      om: 'Odeeffannoon kee kan fayyaa barbaachisaan, balaa tasaaf qophaa’aadha.',
    },
  },
];


export function OnboardingCarousel({ onOnboardingComplete }: { onOnboardingComplete: () => void }) {
  const { getTranslation } = useLanguage();
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const handleNext = () => {
    if (api) {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        onOnboardingComplete();
      }
    }
  }
  
  const handleSkip = () => {
    onOnboardingComplete();
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background">
        <div className="w-full flex justify-end p-4">
            {current < onboardingSteps.length && (
                <Button variant="ghost" onClick={handleSkip}>{getTranslation({ en: 'Skip', am: 'ዝለል', om: 'Ce\'i' })}</Button>
            )}
        </div>
        
        <Carousel className="w-full flex-grow" setApi={setApi}>
          <CarouselContent>
            {onboardingSteps.map((step, index) => {
              const imageData = PlaceHolderImages.find(img => img.id === step.id);
              return (
                <CarouselItem key={index}>
                    <div className="h-full flex flex-col items-center justify-between p-4">
                        {imageData && (
                          <div className='w-full aspect-square max-w-sm flex items-center justify-center'>
                            <Image
                                src={imageData.imageUrl}
                                alt={imageData.description}
                                data-ai-hint={imageData.imageHint}
                                width={400}
                                height={400}
                                className="rounded-lg object-contain"
                            />
                          </div>
                        )}
                        <Card className="w-full max-w-md rounded-t-3xl shadow-2xl mt-auto">
                          <CardContent className="p-8 text-center space-y-6">
                            <h2 className="font-headline text-3xl text-foreground">{getTranslation(step.title)}</h2>
                            <p className="mt-2 text-muted-foreground text-lg">{getTranslation(step.description)}</p>
                           
                            <div className="flex justify-between items-center pt-4">
                                <div className="flex gap-2">
                                    {onboardingSteps.map((_, i) => (
                                        <div key={i} className={`h-1.5 rounded-full transition-all ${current === i ? 'w-6 bg-primary' : 'w-3 bg-muted'}`} />
                                    ))}
                                </div>
                                <Button size="icon" className="rounded-full h-14 w-14" onClick={handleNext}>
                                    <ArrowRight className="h-6 w-6" />
                                </Button>
                            </div>
                          </CardContent>
                        </Card>
                    </div>
                </CarouselItem>
              );
            })}
             <CarouselItem>
                <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                    <Icons.logo className="h-24 w-24" />
                    <h2 className="font-headline text-4xl mt-6">{getTranslation({en: "Let's get started!", am: "እንጀምር!", om: "Hajaa Jalqabnu!"})}</h2>
                    <p className="mt-2 text-muted-foreground max-w-sm">{getTranslation({en: "Enjoy the features we've provided, and stay healthy!", am: "ባቀረብናቸው ባህሪያት ይደሰቱ እና ጤናማ ይሁኑ!", om: "Amaloota isiniif qophoofneen gammadaa, fayyaa ta'aatii!"})}</p>
                    <Button onClick={onOnboardingComplete} className="mt-12 w-full max-w-xs" size="lg">
                        {getTranslation({ en: 'Continue', am: 'ቀጥል', om: 'Itti Fufi' })}
                    </Button>
                </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
    </div>
  );
}