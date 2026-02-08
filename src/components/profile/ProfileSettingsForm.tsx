'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { CHAIN_OPTIONS, TEXT_RECORD_KEYS } from '@/config/ens';
import { chainLabels, chainTokenSupport } from '@/config/chains';
import { getEnsNameForAddress, resolvePaymentProfile } from '@/services/ens/resolvePaymentProfile';
import {
  ENS_PUBLIC_RESOLVER_ABI,
  ENS_REGISTRY_ABI,
  ENS_REGISTRY_ADDRESS,
  getNamehash,
} from '@/services/ens/writeTextRecords';
import type { ChainPreference } from '@/types/ens';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export function ProfileSettingsForm() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [ensName, setEnsName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const [chain, setChain] = useState<ChainPreference>('ethereum');
  const [fastMode, setFastMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [preferredToken, setPreferredToken] = useState('USDC');

  useEffect(() => {
    async function loadProfile() {
      if (!address) return;
      setLoading(true);
      try {
        const name = await getEnsNameForAddress(address);
        setEnsName(name);
        if (name) {
          const profile = await resolvePaymentProfile(name);
          setChain(profile.preferredChain);
          setFastMode(profile.fastMode);
          setDisplayName(profile.displayName || '');
          setPreferredToken(profile.preferredToken || 'USDC');
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [address]);

  // Auto-switch to USDC if selected token is not supported on selected chain
  useEffect(() => {
    const supportedTokens = chainTokenSupport[chain] || ['USDC'];
    if (!supportedTokens.includes(preferredToken)) {
      setPreferredToken('USDC');
    }
  }, [chain, preferredToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensName || !walletClient || !publicClient) return;

    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      const node = getNamehash(ensName);

      setCurrentStep('Fetching resolver...');
      const resolverAddress = await publicClient.readContract({
        address: ENS_REGISTRY_ADDRESS,
        abi: ENS_REGISTRY_ABI,
        functionName: 'resolver',
        args: [node],
      });

      if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('No resolver set for this ENS name');
      }

      const records = [
        { key: TEXT_RECORD_KEYS.PREFERRED_CHAIN, value: chain },
        { key: TEXT_RECORD_KEYS.FAST_MODE, value: String(fastMode) },
        { key: TEXT_RECORD_KEYS.DISPLAY_NAME, value: displayName },
        { key: TEXT_RECORD_KEYS.PREFERRED_TOKEN, value: preferredToken },
      ];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        setCurrentStep(`Setting ${record.key} (${i + 1}/${records.length})...`);

        const hash = await walletClient.writeContract({
          address: resolverAddress,
          abi: ENS_PUBLIC_RESOLVER_ABI,
          functionName: 'setText',
          args: [node, record.key, record.value],
        });

        setCurrentStep(`Waiting for confirmation (${i + 1}/${records.length})...`);
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setSaveStatus('success');
      setCurrentStep(null);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update text records');
      setCurrentStep(null);
    }
  };

  if (!isConnected) {
    return (
      <Card variant="elevated" padding="lg" className="text-center space-y-3 animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-text-tertiary" />
        </div>
        <div>
          <p className="font-display font-semibold text-text-primary">
            Wallet not connected
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Connect your wallet to manage your payment preferences
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card variant="elevated" padding="lg" className="text-center space-y-3 animate-fade-in">
        <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
        <p className="text-text-secondary">Loading your profile...</p>
      </Card>
    );
  }

  if (!ensName) {
    return (
      <Card variant="elevated" padding="lg" className="text-center space-y-4 animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-text-tertiary" />
        </div>
        <div>
          <p className="font-display font-semibold text-text-primary mb-2">
            No ENS name found
          </p>
          <p className="text-sm text-text-secondary mb-4">
            Set a primary ENS name to configure payment preferences
          </p>
          <a 
            href="https://sepolia.app.ens.domains/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to ENS Domains
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
      {/* ENS Name Display */}
      <Card variant="elevated" padding="md">
        <p className="text-sm font-medium text-text-secondary mb-1">
          Managing preferences for
        </p>
        <p className="text-xl font-display font-semibold text-text-primary">
          {ensName}
        </p>
      </Card>

      {/* Form Fields */}
      <div className="space-y-5">
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
        />

        <Select
          label="Preferred Settlement Chain"
          value={chain}
          onChange={(e) => setChain(e.target.value as ChainPreference)}
          options={CHAIN_OPTIONS.map((c) => ({ value: c, label: chainLabels[c] }))}
        />

        <div className="space-y-2">
          <Select
            label="Preferred Token"
            value={preferredToken}
            onChange={(e) => setPreferredToken(e.target.value)}
            options={[
              { value: 'USDC', label: 'USDC' },
              { 
                value: 'USDT', 
                label: `USDT${!chainTokenSupport[chain]?.includes('USDT') ? ' (Unavailable)' : ''}`,
                disabled: !chainTokenSupport[chain]?.includes('USDT')
              },
              { 
                value: 'DAI', 
                label: `DAI${!chainTokenSupport[chain]?.includes('DAI') ? ' (Unavailable)' : ''}`,
                disabled: !chainTokenSupport[chain]?.includes('DAI')
              },
            ]}
          />
          {chain === 'arc' && preferredToken !== 'USDC' && (
            <p className="text-xs text-text-tertiary">
              Note: Arc Network only supports USDC natively
            </p>
          )}
        </div>

        <Toggle
          label="Fast Mode"
          description="Enable gasless payments via Yellow Network state channels"
          checked={fastMode}
          onChange={setFastMode}
        />
      </div>

      {/* Text Records Preview */}
      <Card variant="default" padding="md" className="bg-surface-elevated/50">
        <p className="text-sm font-medium text-text-secondary mb-3">
          Text records to be updated:
        </p>
        <ul className="space-y-1.5 font-mono text-xs text-text-secondary">
          <li className="flex items-center gap-2">
            <span className="text-text-tertiary">•</span>
            <span>{TEXT_RECORD_KEYS.PREFERRED_CHAIN}:</span>
            <span className="text-text-primary font-medium">{chain}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-text-tertiary">•</span>
            <span>{TEXT_RECORD_KEYS.PREFERRED_TOKEN}:</span>
            <span className="text-text-primary font-medium">{preferredToken}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-text-tertiary">•</span>
            <span>{TEXT_RECORD_KEYS.FAST_MODE}:</span>
            <span className="text-text-primary font-medium">{String(fastMode)}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-text-tertiary">•</span>
            <span>{TEXT_RECORD_KEYS.DISPLAY_NAME}:</span>
            <span className="text-text-primary font-medium">{displayName || '(empty)'}</span>
          </li>
        </ul>
      </Card>

      {/* Status Messages */}
      {currentStep && (
        <Card variant="default" padding="sm" className="border-primary/20 bg-primary/5 animate-fade-in">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
            <p className="text-sm text-primary">{currentStep}</p>
          </div>
        </Card>
      )}

      {saveStatus === 'success' && (
        <Card variant="default" padding="sm" className="border-accent-green/20 bg-accent-green/5 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent-green flex-shrink-0" />
            <p className="text-sm text-accent-green font-medium">
              Text records updated successfully!
            </p>
          </div>
        </Card>
      )}

      {saveStatus === 'error' && errorMessage && (
        <Card variant="default" padding="sm" className="border-accent-red/20 bg-accent-red/5 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-accent-red flex-shrink-0" />
            <p className="text-sm text-accent-red">{errorMessage}</p>
          </div>
        </Card>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        loading={saveStatus === 'saving'} 
        className="w-full"
        size="lg"
      >
        {saveStatus === 'success' ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Saved!
          </>
        ) : (
          'Save Preferences'
        )}
      </Button>
    </form>
  );
}
