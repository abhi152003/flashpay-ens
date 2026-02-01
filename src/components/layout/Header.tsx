'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Zap } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Pay' },
  { href: '/profile', label: 'Profile' },
  { href: '/history', label: 'History' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-1.5">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">FlashPay</span>
            <span className="text-lg text-zinc-500">.ens</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <ConnectButton />
      </div>
    </header>
  );
}
