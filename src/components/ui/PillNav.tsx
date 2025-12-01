// @ts-nocheck
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import './PillNav.css';
import { Icons } from '../icons';
import { useLanguage } from '@/hooks/use-language';
import { LanguageSwitcher } from '../language-switcher';
import { Home, MessageSquare, ScanLine, User, QrCode } from 'lucide-react';

const navIcons = {
  '/home': Home,
  '/assistant': MessageSquare,
  '/scan-medicine': ScanLine,
  '/my-qr-info': QrCode,
  '/profile': User,
}


type NavItem = {
  label: Record<string, string>;
  href: string;
};

export const PillNav = ({
  items,
  className = '',
  ease = 'power3.easeOut',
  baseColor = 'hsl(var(--card))',
  pillColor = 'hsl(var(--primary))',
  hoveredPillTextColor = 'hsl(var(--primary-foreground))',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
}: {
  items: NavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}) => {
  const { getTranslation } = useLanguage();
  const activeHref = usePathname();
  const resolvedPillTextColor = pillTextColor ?? 'hsl(var(--primary))';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const translatedItems = useMemo(() => items.map(item => ({...item, label: getTranslation(item.label) })), [items, getTranslation]);


  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': resolvedPillTextColor,
    '--nav-h': '60px',
    '--pill-pad-x': '1rem',
  };

  return (
    <nav className={`pill-nav-container ${className}`} style={cssVars}>
      <ul className="pill-list" role="menubar">
        {translatedItems.map((item, i) => {
          const Icon = navIcons[item.href];
          const isActive = activeHref === item.href;
          return (
            <li key={item.href || `item-${i}`} role="none">
              <Link
                role="menuitem"
                href={item.href}
                className={`pill-item ${isActive ? 'is-active' : ''}`}
                aria-label={item.label}
              >
                <div className="pill-icon">
                  <Icon className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'} />
                </div>
                <span className={`pill-label ${isActive ? 'active' : ''}`}>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  );
};

