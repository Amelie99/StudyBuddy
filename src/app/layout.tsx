import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'StudyBuddy HS Landshut',
  description: 'Plattform für Studierende der Hochschule Landshut um Buddies zu finden.',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head />
      <body className={cn("font-body antialiased min-h-screen flex flex-col", inter.variable)}>
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="HAW Landshut campus background"
          fill
          className="fixed inset-0 z-[-1] object-cover opacity-[0.15] saturate-75"
          data-ai-hint="university campus courtyard"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
