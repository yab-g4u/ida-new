import { PillNav } from '@/components/ui/PillNav';

const navItems = [
    { href: '/home', label: { en: 'Home', am: 'መነሻ', om: 'Mana' } },
    { href: '/assistant', label: { en: 'Assistant', am: 'ረዳት', om: 'Gargaaraa' } },
    { href: '/scan-medicine', label: { en: 'Scan', am: 'ስካን', om: 'Skaan' } },
    { href: '/my-qr-info', label: { en: 'QR Info', am: 'QR መረጃ', om: 'Odeeffannoo QR' } },
];


export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <PillNav items={navItems} />
    </div>
  );
}
