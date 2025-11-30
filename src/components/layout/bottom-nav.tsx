'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, History, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '../language-switcher';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/assistant', icon: MessageSquare, label: 'Assistant' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="sticky bottom-0 z-10 w-full border-t bg-background/95 backdrop-blur-sm">
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
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
