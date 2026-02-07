'use client';

import { useAccount } from 'wagmi';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Zap, Shield, Globe } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-12 md:space-y-16 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 md:space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight">
          Pay anyone by their{' '}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              .eth name
            </span>
            <span className="absolute inset-0 blur-xl bg-gradient-to-r from-primary/30 to-primary-hover/30 animate-pulse" />
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto font-medium px-4">
          Instantly. Gasless. Cross-chain. The simplest way to send crypto.
        </p>
      </div>

      {/* Payment Form */}
      {isConnected ? (
        <div className="mx-auto max-w-lg animate-scale-in px-4 sm:px-0">
          <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-border-hover">
            <PaymentForm />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-lg animate-scale-in px-4 sm:px-0">
          <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 text-center shadow-lg">
            <p className="text-text-secondary text-base md:text-lg">
              Connect your wallet to start sending payments
            </p>
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-16 md:mt-20 px-4 sm:px-0">
        <div className="group rounded-2xl border border-border bg-surface p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-border-hover animate-fade-in stagger-1">
          <div className="mb-3 md:mb-4 inline-flex items-center justify-center rounded-xl bg-accent-yellow/10 p-2.5 md:p-3 transition-transform duration-300 group-hover:scale-110">
            <Zap className="h-5 w-5 md:h-6 md:w-6 text-accent-yellow" />
          </div>
          <h3 className="font-display font-semibold text-base md:text-lg text-text-primary mb-2">
            Gasless Transfers
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Yellow Network state channels enable instant, zero-fee payments
          </p>
        </div>

        <div className="group rounded-2xl border border-border bg-surface p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-border-hover animate-fade-in stagger-2">
          <div className="mb-3 md:mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-2.5 md:p-3 transition-transform duration-300 group-hover:scale-110">
            <Globe className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-base md:text-lg text-text-primary mb-2">
            Cross-Chain Settlement
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Circle Gateway bridges USDC to recipient's preferred chain
          </p>
        </div>

        <div className="group rounded-2xl border border-border bg-surface p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-border-hover animate-fade-in stagger-3 sm:col-span-2 lg:col-span-1">
          <div className="mb-3 md:mb-4 inline-flex items-center justify-center rounded-xl bg-accent-green/10 p-2.5 md:p-3 transition-transform duration-300 group-hover:scale-110">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-accent-green" />
          </div>
          <h3 className="font-display font-semibold text-base md:text-lg text-text-primary mb-2">
            ENS-Powered
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Payment preferences stored securely in ENS text records
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-20 md:mt-24 text-center space-y-8 md:space-y-12 animate-fade-in stagger-4 px-4 sm:px-0">
        <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
          How it works
        </h2>
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="font-display font-semibold text-primary">1</span>
            </div>
            <h4 className="font-display font-medium text-text-primary">Enter .eth name</h4>
            <p className="text-sm text-text-secondary px-4 sm:px-0">
              Type any Ethereum Name Service address
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="font-display font-semibold text-primary">2</span>
            </div>
            <h4 className="font-display font-medium text-text-primary">Set amount</h4>
            <p className="text-sm text-text-secondary px-4 sm:px-0">
              Choose how much USDC to send
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="font-display font-semibold text-primary">3</span>
            </div>
            <h4 className="font-display font-medium text-text-primary">Send instantly</h4>
            <p className="text-sm text-text-secondary px-4 sm:px-0">
              Payment delivered gasless and cross-chain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
