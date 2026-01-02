'use client';

import { OnboardingCarousel } from '@/components/onboarding-carousel';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  const handleOnboardingComplete = () => {
     try {
      localStorage.setItem('onboardingComplete', 'true');
    } catch (e) {
      console.warn('Could not save onboarding status to localStorage.');
    }
    // After onboarding, the main page will handle the anonymous login
    router.push('/'); 
  }

  return <OnboardingCarousel onOnboardingComplete={handleOnboardingComplete} />;
}
