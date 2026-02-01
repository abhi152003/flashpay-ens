'use client';

import { useState } from 'react';
import { Send, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ENSInput } from '@/components/ens/ENSInput';
import { sendOffchainUSDC } from '@/services/yellow';
import { useTxStore } from '@/hooks/useTxStore';
import type { PaymentProfile } from '@/types/ens';
import type { PaymentStatus } from '@/types/payments';

export function PaymentForm() {
  const [ensName, setEnsName] = useState('');
  const [recipient, setRecipient] = useState<PaymentProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const { addTransaction } = useTxStore();

  const isValid = recipient?.resolvedAddress && parseFloat(amount) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient?.resolvedAddress || !amount) return;

    setStatus('confirming');

    const txId = `tx-${Date.now()}`;
    const mode = recipient.fastMode ? 'fast' : 'onchain';

    addTransaction({
      id: txId,
      recipientEns: recipient.ensName,
      recipientAddress: recipient.resolvedAddress,
      amount,
      mode,
      status: 'pending',
      createdAt: Date.now(),
    });

    try {
      if (recipient.fastMode) {
        await sendOffchainUSDC({
          to: recipient.resolvedAddress,
          amount,
        });
      } else {
        await new Promise((r) => setTimeout(r, 1500));
      }

      setStatus('success');
      setAmount('');
      setEnsName('');
      setRecipient(null);

      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('failed');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-400">
          Recipient
        </label>
        <ENSInput
          value={ensName}
          onChange={setEnsName}
          onResolve={setRecipient}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-400">
          Amount
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-4 pl-4 pr-20 text-2xl text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-zinc-400">
            USDC
          </span>
        </div>
      </div>

      {recipient?.resolvedAddress && (
        <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2 text-sm">
          {recipient.fastMode ? (
            <>
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-zinc-300">Gasless via Yellow Network</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-zinc-300">
                Settling to {recipient.preferredChain}
              </span>
            </>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isValid}
        loading={status === 'confirming'}
        className="w-full py-4 text-lg"
      >
        {status === 'success' ? (
          'Payment Sent!'
        ) : status === 'failed' ? (
          'Payment Failed'
        ) : (
          <>
            <Send className="h-5 w-5" />
            Pay
          </>
        )}
      </Button>
    </form>
  );
}
