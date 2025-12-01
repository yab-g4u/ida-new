'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-provider';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { getTranslation, language } = useLanguage();

  const chatsQuery = userId && db
    ? query(collection(db, `users/${userId}/chats`), orderBy('createdAt', 'desc'))
    : null;
  const { data: chats, loading } = useCollection(chatsQuery);

  const translations = {
    newChat: { en: 'New Chat', am: 'አዲስ ውይይት', om: 'Haasaa Haaraa' },
    toggleSidebar: { en: 'Toggle sidebar', am: 'የጎን አሞሌን ቀይር', om: 'Sidebar Jijjiiri' },
    aiAssistant: { en: 'AI Assistant', am: 'AI ረዳት', om: 'Gargaaraa AI' },
    defaultChatTitle: { en: 'New Chat', am: 'አዲስ ውይይት', om: 'Haasaa Haaraa' },
  };

  const SidebarContent = () => (
    <>
      <div className="p-4">
        <Link href="/assistant/new" passHref>
          <Button className="w-full">
            <PlusCircle className="mr-2 h-5 w-5" />
            {getTranslation(translations.newChat)}
          </Button>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4 pt-0">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          {chats?.map(chat => (
            <Link
              key={chat.id}
              href={`/assistant/${chat.id}`}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                pathname === `/assistant/${chat.id}` && 'bg-muted text-primary'
              )}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="truncate flex-1">{chat.title || getTranslation(translations.defaultChatTitle)}</span>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-muted/40">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col w-72 border-r bg-background transition-all duration-300',
          isSidebarOpen ? 'ml-0' : '-ml-72'
        )}
      >
        {SidebarContent()}
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
         <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside
        className={cn(
          'fixed z-50 md:hidden flex flex-col w-72 border-r bg-background h-full transition-all duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {SidebarContent()}
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">{getTranslation(translations.toggleSidebar)}</span>
          </Button>
          <h1 className="text-lg font-semibold md:text-xl">{getTranslation(translations.aiAssistant)}</h1>
        </header>
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}