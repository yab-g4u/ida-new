import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-provider';
import { LanguageProvider } from '@/contexts/language-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/theme-provider';
import { FirebaseClientProvider } from '@/firebase';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'IDA: Your AI Health Ally',
  description: 'An AI-powered digital health assistant for accessible medical information.',
  icons: {
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yNTYgMTYzQzI5Mi42MjcgMTYzIDMyMi41IDE5Mi44NzMgMzIyLjUgMjI5LjVDMzIyLjUgMjY2LjEyNyAyOTIuNjI3IDI5NiAyNTYgMjk2QzIxOS4zNzMgMjk2IDE4OS41IDI2Ni4xMjcgMTg5LjUgMjI5LjVDMTg5LjUgMTkyLjg3MyAyMTkuMzczIDE2MyAyNTYgMTYzWiIgZmlsbD0iIzJFOTBGQSIvPgo8cGF0aCBkPSJNMzc0IDI0Ni41QzM4OS43MzQgMjQ2LjUgNDAyLjUgMjMzLjczNCA0MDIuNSAyMThDNDAyLjUgMjAyLjI2NiAzODkuNzM0IDE4OS41IDM3NCAxODkuNUMzNTguMjY2IDE4OS41IDM0NS41IDIwMi4yNjYgMzQ1LjUgMjE4QzM0NS41IDIzMy43MzQgMzU4LjI2NiAyNDYuNSAzNzQgMjQ2LjVaIiBmaWxsPSIjMzBCNThCIi8+CjxwYXRoIGQ9Ik00NDEgMjk2QzQ1Ni43MzQgMjk2IDQ2OS41IDI4My4yMzQgNDY5LjUgMjY3LjVDNDY5LjUgMjUxLjc2NiA0NTYuNzM0IDIzOSA0NDEgMjM5QzQyNS4yNjYgMjM5IDQxMi41IDI1MS43NjYgNDEyLjUgMjY3LjVDNDEyLjUgMjgzLjIzNCA0MjUuMjY2IDI5NiA0NDEgMjk2WiIgZmlsbD0iIzMwQjU4QiIvPgo8cGF0aCBkPSJNMTE4IDI0Ni41QzE1My43MzQgMjQ2LjUgMTY2LjUgMjMzLjczNCAxNjYuNSAyMThDMTY2LjUgMjAyLjI2NiAxNTMuNzM0IDE4OS41IDEzOCAxODkuNUMxMjIuMjY2IDE4OS41IDEwOS41IDIwMi4yNjYgMTA5LjUgMjE4QzEwOS41IDIzMy43MzQgMTIyLjI2NiAyNDYuNSAxMzggMjQ2LjVaIiBmaWxsPSIjMzBCNThCIi8+CjxwYXRoIGQ9Ik0xMDEuNSAyOTZDMTE2LjIzNCAyOTYgMTI5IDI4My4yMzQgMTI5IDI2Ny41QzEyOSAyNTEuNzY2IDExNi4yMzQgMjM5IDEwMS41IDIzOUM4Ni43NjU1IDIzOSA3NCAyNTEuNzY2IDc0IDI2Ny41Qzc0IDI4My4yMzQgODYuNzY1NSAyOTYgMTAxLjUgMjk2WiIgZmlsbD0iIzMwQjU4QiIvPgo8cGF0aCBkPSJNMjU2IDI0Ni41TDI1NiAzODRDMjU2IDM4NCAyNTUuNSA0NTUuNSAxNjYuNSA0NTUuNUM3Ny41IDQ1NS41IDc0IDM4NCA3NCAzODRMNzQgMzIyLjVDNzQgMzIyLjUgMTAxLjUgMzEyIDExOS41IDMyMi41QzEzNy41IDMzMyAxMjkgMzUwIDEyOSAzNTBDMTI5IDM1MCAxNjAgMzU3LjUgMTg5LjUgMzMzQzIxOSAzMDguNSAyNTYgMjQ2LjUgMjU2IDI0Ni41WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzNfMykiLz4KPHBhdGggZD0iTTI1NiAyNDYuNUwyNTYgMzg0QzI1NiAzODQgMjU2LjUgNDU1LjUgMzQ1LjUgNDU1LjVDNDM0LjUgNDU1LjUgNDM5IDM4NCA0MzkgMzg0TDQzOSAzMjIuNUM0MzkgMzIyLjUgNDExLjUgMzEyIDM5My41IDMyMi41QzM3NS41IDMzMyAzODQgMzUwIDM4NCAzNTBDMzg0IDM1MCAzNTMgMzU3LjUgMzIzLjUgMzMzQzI5NCAzMDguNSAyNTYgMjQ2LjUgMjU2IDI0Ni41WiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzNfMykiLz4KPHBhdGggZD0iTTMxMi41IDE5OS41QzMxMi41IDE5OS41IDMxMi41IDEzMS41IDI1NiA4N0MxOTkuNSA0Mi41IDE5OS41IDE5OS41IDE5OS41IDE5OS41IiBzdHJva2U9IiMyRTkwRkEiIHN0cm9rZS13aWR0aD0iMjUiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8zXzMiIHgxPSIxNjUiIHkxPSIyNDYiIHgyPSIxNjUiIHkyPSI0NTUuNSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMzBCNThCIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzgwRDREQyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXJfM18zIiB4MT0iMzQ2LjUiIHkxPSIyNDYuNSIgeDI9IjM0Ni41IiB5Mj0iNDU1LjUiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzMwQjU4QiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM4MEQ0QkMiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&display=swap" rel="stylesheet" />
        
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseClientProvider>
            <AuthProvider>
              <LanguageProvider>
                {children}
                <Toaster />
              </LanguageProvider>
            </AuthProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
