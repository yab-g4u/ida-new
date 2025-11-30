'use client';

import { BottomNav } from './bottom-nav';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex h-screen w-full max-w-md flex-col border-x bg-background shadow-lg">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
