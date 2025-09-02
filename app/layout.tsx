import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/app/providers';

// Load the font with display: 'swap' to prevent layout shift
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Luma - Your Mental Health Copilot',
  description: 'A compassionate AI companion for your mental health journey',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      
    <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <ClerkProvider>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
          </div>
        </Providers>
      </ClerkProvider>
    </body>
  </html>
  );
}
