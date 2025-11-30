import { MobileLayout } from '@/components/layout/mobile-layout';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MobileLayout>{children}</MobileLayout>;
}
