'use client';

import { useAccount } from 'wagmi';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Zap, Shield, Globe } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Pay anyone by their{' '}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            .eth name
          </span>
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Instantly. Gasless. Cross-chain.
        </p>
      </div>

      {isConnected ? (
        <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <PaymentForm />
        </div>
      ) : (
        <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-400">Connect your wallet to start sending payments</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="mb-3 inline-block rounded-lg bg-yellow-500/20 p-2">
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <h3 className="font-medium text-white">Gasless Transfers</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Yellow Network state channels for instant, gas-free payments
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="mb-3 inline-block rounded-lg bg-blue-500/20 p-2">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="font-medium text-white">Cross-Chain Settlement</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Circle Gateway bridges USDC to recipient&apos;s preferred chain
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="mb-3 inline-block rounded-lg bg-green-500/20 p-2">
            <Shield className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="font-medium text-white">ENS-Powered</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Custom text records store your payment preferences securely
          </p>
        </div>
      </div>
    </div>
  );
}
