'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-provider';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function AssistantRedirectPage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();
  const db = useFirestore();

  const userChatsQuery = userId && db ? query(
    collection(db, `users/${userId}/chats`),
    orderBy('createdAt', 'desc'),
    limit(1)
  ) : null;

  const { data: chats, loading: chatsLoading } = useCollection(userChatsQuery);

  useEffect(() => {
    if (authLoading || chatsLoading) {
      return;
    }

    if (!userId) {
      router.push('/login');
      return;
    }

    if (chats && chats.length > 0) {
      router.replace(`/assistant/${chats[0].id}`);
    } else {
       router.replace('/assistant/new');
    }
  }, [userId, chats, authLoading, chatsLoading, router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
