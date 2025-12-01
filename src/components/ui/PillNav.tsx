// @ts-nocheck
'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './PillNav.css';
import { useLanguage } from '@/hooks/use-language';
import { Home, MessageSquare, ScanLine, QrCode } from 'lucide-react';

const navIcons = {
  '/home': Home,
  '/assistant': MessageSquare,
  '/scan-medicine': ScanLine,
  '/my-qr-info': QrCode,
};


type NavItem = {
  label: Record<string, string>;
  href: string;
};

export const PillNav = ({ items }: { items: NavItem[] }) => {
  const { getTranslation } = useLanguage();
  const activeHref = usePathname();
  
  const translatedItems = useMemo(() => items.map(item => ({...item, label: getTranslation(item.label) })), [items, getTranslation]);

  useEffect(() => {
    // This is a workaround to trigger a re-render when the language changes.
  }, [getTranslation]);

  return (
    <nav className="pill-nav-container">
      <ul className="pill-list" role="menubar">
        {translatedItems.map((item) => {
          const Icon = navIcons[item.href];
          const isActive = activeHref === item.href;
          return (
            <li key={item.href} role="none" className="pill-item-wrapper">
              <Link
                role="menuitem"
                href={item.href}
                className={`pill-item ${isActive ? 'is-active' : ''}`}
                aria-label={item.label}
              >
                <div className="pill-content">
                  <div className="pill-icon">
                    <Icon />
                  </div>
                  {isActive && <span className="pill-label">{item.label}</span>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
