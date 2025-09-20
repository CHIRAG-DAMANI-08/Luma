// /app/layout.tsx
import './globals.css'; // This imports your global variables
import type { Metadata } from 'next';
import { Lexend } from 'next/font/google'; // <-- 1. Change from Inter to Lexend
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/app/providers';

// 2. Configure the Lexend font
const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend', // Use a CSS variable for the font
  weight: ['400', '500', '700', '900'],
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
    // 3. Apply the Lexend font variable to the <html> tag
    <html lang="en" className={lexend.variable} suppressHydrationWarning>
      <body style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)'
      }}>
        <ClerkProvider>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">{children}</main>
              <Toaster />
            </div>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}