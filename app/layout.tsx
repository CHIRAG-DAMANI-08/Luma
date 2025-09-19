// /app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/app/providers';

// Configure the Lexend font
const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
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
    <html lang="en" className={lexend.variable} suppressHydrationWarning>
      <head>
        {/* Add OneSignal SDK */}
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "1fdccdfc-93e3-4759-b153-f881c66ba78f",
                safari_web_id: "web.onesignal.auto.44e6ca0d-bbca-461f-908e-69d9a6be2a2a",
                notifyButton: {
                  enable: true,
                },
                allowLocalhostAsSecureOrigin: true,
              });
            });
          `
        }} />
      </head>
      <body style={{ 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)'
      }}>
        <ClerkProvider>
          <Providers>
            {/* Remove Service Worker Registration since OneSignal handles this */}
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