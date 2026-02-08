'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Zap, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Pay' },
  { href: '/profile', label: 'Profile' },
  { href: '/history', label: 'History' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group" onClick={() => setMobileMenuOpen(false)}>
          <div className="rounded-xl bg-primary p-1.5 md:p-2 transition-transform duration-300 group-hover:scale-110 shadow-md">
            <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg md:text-xl font-display font-semibold text-text-primary">
              FlashPay
            </span>
            <span className="text-lg md:text-xl font-display text-text-tertiary">.ens</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                relative rounded-xl px-4 py-2 text-sm font-medium 
                transition-all duration-200
                ${
                  pathname === link.href
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          
          {/* Desktop Connect Button */}
          <div className="hidden sm:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="
              cursor-pointer md:hidden rounded-lg p-2 transition-all duration-200
              bg-surface-elevated hover:bg-border
              border border-border hover:border-border-hover
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
              active:scale-95
            "
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-text-secondary" />
            ) : (
              <Menu className="h-5 w-5 text-text-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-surface/95 backdrop-blur-xl animate-fade-in">
          <nav className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block rounded-xl px-4 py-3 text-base font-medium transition-all duration-200
                  ${pathname === link.href
                    ? 'bg-surface-elevated text-text-primary shadow-sm border border-border'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Connect Button */}
            <div className="pt-2 sm:hidden">
              <ConnectButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
