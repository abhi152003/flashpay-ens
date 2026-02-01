'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { CHAIN_OPTIONS, TEXT_RECORD_KEYS } from '@/config/ens';
import { chainLabels } from '@/config/chains';
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
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [address]);

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
        { key: TEXT_RECORD_KEYS.PREFERRED_TOKEN, value: 'USDC' },
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
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">Connect your wallet to manage your payment preferences</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">Loading your profile...</p>
      </div>
    );
  }

  if (!ensName) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-8 text-center">
        <p className="mb-2 text-zinc-400">No ENS name found for your address</p>
        <p className="text-sm text-zinc-500">
          Set a primary ENS name at{' '}
          <a href="https://app.ens.domains" className="text-blue-400 hover:underline" target="_blank">
            app.ens.domains
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
        <p className="text-sm text-zinc-400">Managing preferences for</p>
        <p className="text-lg font-medium text-white">{ensName}</p>
      </div>

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

      <Toggle
        label="Fast Mode"
        description="Enable gasless payments via Yellow Network state channels"
        checked={fastMode}
        onChange={setFastMode}
      />

      <div className="rounded-lg bg-zinc-800/30 p-4 text-sm text-zinc-400">
        <p className="mb-2 font-medium text-zinc-300">Text records to be updated:</p>
        <ul className="space-y-1 font-mono text-xs">
          <li>{TEXT_RECORD_KEYS.PREFERRED_CHAIN}: {chain}</li>
          <li>{TEXT_RECORD_KEYS.FAST_MODE}: {String(fastMode)}</li>
          <li>{TEXT_RECORD_KEYS.DISPLAY_NAME}: {displayName || '(empty)'}</li>
        </ul>
      </div>

      {currentStep && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-400">
          {currentStep}
        </div>
      )}

      {saveStatus === 'success' && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
          Text records updated successfully!
        </div>
      )}

      {saveStatus === 'error' && errorMessage && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      <Button type="submit" loading={saveStatus === 'saving'} className="w-full">
        {saveStatus === 'success' ? 'Saved!' : 'Save Preferences'}
      </Button>
    </form>
  );
}
