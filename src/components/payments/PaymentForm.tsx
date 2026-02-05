'use client';

import { useState, useEffect } from 'react';
import { Send, Zap, Globe, Wallet, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ENSInput } from '@/components/ens/ENSInput';
import { useTxStore } from '@/hooks/useTxStore';
import { useArcBalance } from '@/hooks/useArcBalance';
import { useYellowNetwork } from '@/hooks/useYellowNetwork';
import { useCCTPBridge, CCTPStatusLabels } from '@/hooks/useCCTPBridge';
import type { PaymentProfile } from '@/types/ens';
import type { PaymentStatus } from '@/types/payments';
import type { Address } from 'viem';

export function PaymentForm() {
  const [ensName, setEnsName] = useState('');
  const [recipient, setRecipient] = useState<PaymentProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const { addTransaction, updateTransaction } = useTxStore();
  const { balance, formatted, isLoading: balanceLoading, chainName } = useArcBalance();

  const {
    isAuthenticated: yellowAuthenticated,
    isConnecting: yellowConnecting,
    error: yellowError,
    connect: connectYellow,
    transfer: yellowTransfer,
  } = useYellowNetwork();

  const {
    status: cctpStatus,
    error: cctpError,
    bridge: cctpBridge,
    reset: resetCCTP,
  } = useCCTPBridge();

  const handleMaxClick = () => {
    setAmount(balance);
  };

  const isValid = recipient?.resolvedAddress && parseFloat(amount) > 0;
  const needsYellowAuth = recipient?.fastMode && !yellowAuthenticated;

  useEffect(() => {
    if (recipient?.fastMode && !yellowAuthenticated && !yellowConnecting) {
      connectYellow().catch(console.error);
    }
  }, [recipient?.fastMode, yellowAuthenticated, yellowConnecting, connectYellow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient?.resolvedAddress || !amount) return;

    if (recipient.fastMode && !yellowAuthenticated) {
      try {
        await connectYellow();
      } catch {
        setStatus('failed');
        setTimeout(() => setStatus('idle'), 3000);
        return;
      }
    }

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
        setStatus('confirming');
        const result = await yellowTransfer(
          recipient.resolvedAddress as Address,
          amount
        );

        if (result.status === 'failed') {
          throw new Error('Yellow transfer failed');
        }

        console.log('✅ Yellow Network transfer complete, txId:', result.transferId);

        if (recipient.preferredChain === 'arc') {
          console.log('🌉 Initiating CCTP settlement to Arc...');

          const bridgeResult = await cctpBridge(
            amount,
            recipient.resolvedAddress as Address
          );

          if (bridgeResult.status === 'failed') {
            console.error('CCTP settlement failed:', bridgeResult.error);
            updateTransaction(txId, {
              status: 'success',
              txHash: result.transferId,
            });
          } else {
            updateTransaction(txId, {
              status: 'success',
              txHash: bridgeResult.mintTxHash || bridgeResult.burnTxHash || result.transferId,
            });
          }
        } else {
          updateTransaction(txId, {
            status: 'success',
            txHash: result.transferId,
          });
        }
      } else {
        const bridgeResult = await cctpBridge(
          amount,
          recipient.resolvedAddress as Address
        );

        if (bridgeResult.status === 'failed') {
          throw new Error(bridgeResult.error || 'Bridge failed');
        }

        updateTransaction(txId, {
          status: 'success',
          txHash: bridgeResult.mintTxHash || bridgeResult.burnTxHash,
        });
      }

      setStatus('success');
      setAmount('');
      setEnsName('');
      setRecipient(null);

      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Payment failed:', error);
      updateTransaction(txId, { status: 'failed' });
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
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-400">Amount</label>
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-zinc-500" />
            <span className="text-zinc-400">
              {chainName} Balance:{' '}
              {balanceLoading ? (
                <span className="text-zinc-500">...</span>
              ) : (
                <span className="font-medium text-white">{formatted} USDC</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={balanceLoading || parseFloat(balance) === 0}
              className="rounded-md bg-zinc-700 px-2 py-0.5 text-xs font-medium text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              MAX
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            max={balance}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-4 pl-4 pr-20 text-2xl text-white placeholder-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-zinc-400">
            USDC
          </span>
        </div>
      </div>

      {recipient?.resolvedAddress && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2 text-sm">
            {recipient.fastMode ? (
              <>
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-zinc-300">
                  1. Yellow Network (instant)
                  {yellowConnecting && ' - connecting...'}
                  {yellowAuthenticated && status !== 'confirming' && ' ✓'}
                  {status === 'confirming' && cctpStatus === 'idle' && ' - transferring...'}
                </span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4 text-purple-500" />
                <span className="text-zinc-300">
                  CCTP Bridge: Sepolia → {recipient.preferredChain === 'arc' ? 'Arc' : recipient.preferredChain}
                  {cctpStatus !== 'idle' && cctpStatus !== 'complete' && cctpStatus !== 'failed' && (
                    <span className="ml-2 text-purple-400">({CCTPStatusLabels[cctpStatus]})</span>
                  )}
                </span>
              </>
            )}
          </div>

          {recipient.fastMode && recipient.preferredChain === 'arc' && (
            <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2 text-sm">
              <ArrowRightLeft className="h-4 w-4 text-purple-500" />
              <span className="text-zinc-300">
                2. Settle to Arc via CCTP
                {cctpStatus !== 'idle' && cctpStatus !== 'complete' && cctpStatus !== 'failed' && (
                  <span className="ml-2 text-purple-400">({CCTPStatusLabels[cctpStatus]})</span>
                )}
                {cctpStatus === 'complete' && <span className="ml-2 text-green-400">✓</span>}
              </span>
            </div>
          )}
        </div>
      )}

      {yellowError && recipient?.fastMode && (
        <div className="flex items-center gap-2 rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>Yellow Network: {yellowError.message}</span>
        </div>
      )}

      {cctpError && (recipient?.preferredChain === 'arc' || !recipient?.fastMode) && (
        <div className="flex items-center gap-2 rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>CCTP Settlement: {cctpError}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={!isValid || (needsYellowAuth && yellowConnecting) || (cctpStatus !== 'idle' && cctpStatus !== 'complete' && cctpStatus !== 'failed')}
        loading={status === 'confirming' || yellowConnecting || (cctpStatus !== 'idle' && cctpStatus !== 'complete' && cctpStatus !== 'failed')}
        className="w-full py-4 text-lg"
      >
        {status === 'success' ? (
          'Payment Complete!'
        ) : status === 'failed' ? (
          'Payment Failed'
        ) : yellowConnecting ? (
          'Connecting to Yellow Network...'
        ) : status === 'confirming' && cctpStatus === 'idle' && recipient?.fastMode ? (
          'Transferring via Yellow...'
        ) : cctpStatus === 'approving' ? (
          'Step 2: Approving USDC...'
        ) : cctpStatus === 'burning' ? (
          'Step 2: Burning on Sepolia...'
        ) : cctpStatus === 'waiting_attestation' ? (
          'Step 2: Waiting for attestation...'
        ) : cctpStatus === 'settling' ? (
          'Step 2: Settling on Arc...'
        ) : (
          <>
            <Send className="h-5 w-5" />
            {recipient?.fastMode
              ? (recipient?.preferredChain === 'arc' ? 'Pay & Settle to Arc' : 'Pay Instantly')
              : 'Bridge & Pay'}
          </>
        )}
      </Button>
    </form>
  );
}
