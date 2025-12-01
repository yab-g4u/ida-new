'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, History, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '../language-switcher';
import { useLanguage } from '@/hooks/use-language';

export function BottomNav() {
  const pathname = usePathname();
  const { getTranslation } = useLanguage();
  
  const navItems = [
    { href: '/home', icon: Home, label: { en: 'Home', am: 'መነሻ', om: 'Mana' } },
    { href: '/assistant', icon: MessageSquare, label: { en: 'Assistant', am: 'ረዳት', om: 'Gargaaraa' } },
    { href: '/history', icon: History, label: { en: 'History', am: 'ታሪክ', om: 'Seenaa' } },
    { href: '/profile', icon: User, label: { en: 'Profile', am: 'መገለጫ', om: 'Profaayilii' } },
  ];

  return (
    <footer className="sticky bottom-0 z-10 w-full border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary',
                isActive && 'text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{getTranslation(item.label)}</span>
            </Link>
          );
        })}
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
