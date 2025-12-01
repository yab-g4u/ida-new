'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export default function AssistantRedirectPage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();

  const userChatsQuery = userId ? query(
    collection(db, `users/${userId}/chats`),
    orderBy('createdAt', 'desc'),
    limit(1)
  ) : null;

  const { data: chats, loading: chatsLoading } = useCollection(userChatsQuery);

  useEffect(() => {
    if (authLoading || chatsLoading) {
      // Still waiting for data
      return;
    }

    if (!userId) {
      // Not logged in, redirect to login
      router.push('/login');
      return;
    }

    if (chats && chats.length > 0) {
      // User has existing chats, redirect to the most recent one
      router.replace(`/assistant/${chats[0].id}`);
    } else {
      // No existing chats, redirect to create a new one
      // The new-chat logic can be handled on the main assistant page or a specific new chat page
      // For simplicity, we'll let the main page handle creating a new chat if no ID is present
       router.replace('/assistant/new');
    }
  }, [userId, chats, authLoading, chatsLoading, router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
