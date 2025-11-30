'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage, type Language } from '@/hooks/use-language';

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

export function OnboardingCarousel() {
  const router = useRouter();
  const { language, getTranslation } = useLanguage();

  const handleGetStarted = () => {
    try {
      localStorage.setItem('onboardingComplete', 'true');
    } catch (e) {
      console.warn('Could not save onboarding status to localStorage.');
    }
    router.push('/home');
  };

  return (
    <Carousel className="w-full max-w-sm" opts={{ loop: true }}>
      <CarouselContent>
        {onboardingSteps.map((step, index) => {
          const imageData = PlaceHolderImages.find(img => img.id === step.id);
          return (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square flex-col items-center justify-center p-6 text-center">
                    {imageData && (
                      <Image
                        src={imageData.imageUrl}
                        alt={imageData.description}
                        data-ai-hint={imageData.imageHint}
                        width={300}
                        height={225}
                        className="mb-4 rounded-lg object-cover"
                      />
                    )}
                    <h2 className="font-headline text-3xl text-primary-foreground">{getTranslation(step.title)}</h2>
                    <p className="mt-2 text-muted-foreground">{getTranslation(step.description)}</p>
                    {index === onboardingSteps.length - 1 && (
                      <Button onClick={handleGetStarted} className="mt-6">
                        {getTranslation({ en: 'Get Started', am: 'ጀምር', om: 'Jalqabi' })}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
