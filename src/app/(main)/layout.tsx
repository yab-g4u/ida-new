import { ResponsiveLayout } from '@/components/layout/responsive-layout';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
