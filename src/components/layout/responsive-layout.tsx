'use client';

import { PillNav } from '../ui/PillNav';
import { Home, MessageSquare, ScanLine, User } from 'lucide-react';


const navItems = [
    { href: '/home', label: { en: 'Home', am: 'መነሻ', om: 'Mana' } },
    { href: '/assistant', label: { en: 'Assistant', am: 'ረዳት', om: 'Gargaaraa' } },
    { href: '/scan-medicine', label: { en: 'Scan', am: 'ስካን', om: 'Skaan' } },
    { href: '/profile', label: { en: 'Profile', am: 'መገለጫ', om: 'Profaayilii' } },
];


export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PillNav items={navItems} />
      <main className="flex-1 pt-24">{children}</main>
    </div>
  );
}
