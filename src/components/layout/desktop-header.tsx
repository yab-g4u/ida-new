'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '../language-switcher';
import { useLanguage } from '@/hooks/use-language';
import { Icons } from '../icons';

export function DesktopHeader() {
  const pathname = usePathname();
  const { getTranslation } = useLanguage();

  const navItems = [
    { href: '/home', icon: Home, label: { en: 'Home', am: 'መነሻ', om: 'Mana' } },
    { href: '/assistant', icon: MessageSquare, label: { en: 'Assistant', am: 'ረዳት', om: 'Gargaaraa' } },
    { href: '/history', icon: History, label: { en: 'History', am: 'ታሪክ', om: 'Seenaa' } },
    { href: '/profile', icon: User, label: { en: 'Profile', am: 'መገለጫ', om: 'Profaayilii' } },
  ];

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 backdrop-blur-sm md:block">
      <div className="container flex h-16 items-center">
        <Link href="/home" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="h-8 w-8" />
          <span className="hidden font-bold sm:inline-block">IDA</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  isActive ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {getTranslation(item.label)}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-end">
            <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
