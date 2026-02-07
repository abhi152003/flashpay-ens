'use client';

import { useEffect, useRef } from 'react';
import { AtSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
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
    <div className="space-y-3 animate-fade-in">
      <div className="relative">
        <AtSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary transition-colors duration-200" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter ENS name (e.g., alice.eth)"
          className="
            w-full rounded-xl border bg-surface px-4 py-4 pl-12 pr-12 text-lg text-text-primary 
            placeholder-text-tertiary outline-none transition-all duration-200
            focus:border-primary focus:ring-2 focus:ring-primary/20
            hover:border-border-hover border-border
          "
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isLoading && <Spinner size="sm" />}
          {!isLoading && profile?.resolvedAddress && (
            <CheckCircle className="h-5 w-5 text-accent-green animate-scale-in" />
          )}
          {!isLoading && error && (
            <AlertCircle className="h-5 w-5 text-accent-red animate-scale-in" />
          )}
        </div>
      </div>

      {profile?.resolvedAddress && (
        <Card variant="elevated" padding="md" className="animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-display font-semibold text-text-primary">
                {profile.displayName || profile.ensName}
              </p>
              <p className="font-mono text-sm text-text-secondary">
                {profile.resolvedAddress.slice(0, 6)}...{profile.resolvedAddress.slice(-4)}
              </p>
            </div>
            <div className="text-right text-sm space-y-1">
              <p className="text-text-secondary">
                Chain: <span className="font-medium text-text-primary">{profile.preferredChain}</span>
              </p>
              {profile.fastMode && (
                <div className="inline-flex items-center gap-1 rounded-full bg-accent-yellow/10 px-2 py-0.5 text-xs font-medium text-accent-yellow">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow animate-pulse" />
                  Fast Mode
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {error && (
        <p className="text-sm text-accent-red flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          Could not resolve ENS name. Please check and try again.
        </p>
      )}
    </div>
  );
}
