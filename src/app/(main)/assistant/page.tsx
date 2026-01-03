'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AssistantRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/assistant/new');
  }, [router]);

  return null;
}
