'use client';

import { BottomNav } from './bottom-nav';
import { DesktopHeader } from './desktop-header';

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DesktopHeader />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
