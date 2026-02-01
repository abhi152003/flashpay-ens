import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/providers/Providers';
import { Header } from '@/components/layout/Header';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FlashPay.ens — ENS Instant Payments',
  description: 'Pay anyone by their .eth name. Instantly. Gasless.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black font-sans text-white antialiased`}
      >
        <Providers>
          <Header />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
