'use client';

import { useEffect, useRef } from 'react';
import { AtSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useEnsPaymentProfile } from '@/hooks/useEnsPaymentProfile';
import type { PaymentProfile } from '@/types/ens';

interface ENSInputProps {
  value: string;
  onChange: (value: string) => void;
  onResolve: (profile: PaymentProfile | null) => void;
}

export function ENSInput({ value, onChange, onResolve }: ENSInputProps) {
  const { data: profile, isLoading, error } = useEnsPaymentProfile(value);
  const lastResolvedRef = useRef<PaymentProfile | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase();
    onChange(newValue);
    if (!newValue.endsWith('.eth')) {
      onResolve(null);
      lastResolvedRef.current = null;
    }
  };

  useEffect(() => {
    let newProfile: PaymentProfile | null = null;
    
    if (profile && !isLoading && !error) {
      newProfile = profile;
    } else if (error || (!profile && !isLoading && value.endsWith('.eth'))) {
      newProfile = null;
    }

    if (newProfile !== lastResolvedRef.current) {
      lastResolvedRef.current = newProfile;
      onResolve(newProfile);
    }
  }, [profile, isLoading, error, value, onResolve]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <AtSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter ENS name (e.g., alice.eth)"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-4 pl-12 pr-12 text-lg text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isLoading && <Spinner size="sm" />}
          {!isLoading && profile?.resolvedAddress && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {!isLoading && error && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>

      {profile?.resolvedAddress && (
        <div className="rounded-xl bg-zinc-800/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">
                {profile.displayName || profile.ensName}
              </p>
              <p className="font-mono text-sm text-zinc-400">
                {profile.resolvedAddress.slice(0, 6)}...{profile.resolvedAddress.slice(-4)}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-zinc-400">
                Chain: <span className="text-white">{profile.preferredChain}</span>
              </p>
              {profile.fastMode && (
                <p className="text-blue-400">Fast Mode enabled</p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">
          Could not resolve ENS name. Please check and try again.
        </p>
      )}
    </div>
  );
}
