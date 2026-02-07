'use client';

import { useState, useEffect } from 'react';
import { Send, Zap, Globe, Wallet, AlertCircle, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
      {/* Recipient Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">
          Recipient
        </label>
        <ENSInput
          value={ensName}
          onChange={setEnsName}
          onResolve={setRecipient}
        />
      </div>

      {/* Amount Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-secondary">Amount</label>
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-text-tertiary" />
            <span className="text-text-secondary">
              {chainName}:{' '}
              {balanceLoading ? (
                <span className="text-text-tertiary">...</span>
              ) : (
                <span className="font-medium text-text-primary">{formatted} USDC</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={balanceLoading || parseFloat(balance) === 0}
              className="
                rounded-lg bg-surface-elevated px-2.5 py-1 text-xs font-medium text-text-primary 
                transition-all duration-200 hover:bg-border hover:shadow-sm active:scale-95
                disabled:cursor-not-allowed disabled:opacity-50
              "
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
            className="
              w-full rounded-xl border bg-surface py-4 pl-4 pr-24 text-2xl font-medium text-text-primary 
              placeholder-text-tertiary outline-none transition-all duration-200
              focus:border-primary focus:ring-2 focus:ring-primary/20
              hover:border-border-hover border-border
            "
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-text-secondary">
            USDC
          </span>
        </div>
      </div>

      {/* Payment Route Info */}
      {recipient?.resolvedAddress && (
        <div className="space-y-2 animate-fade-in">
          <Card variant="elevated" padding="sm" className="space-y-2">
            <div className="flex items-center gap-3 px-2 py-1">
              {recipient.fastMode ? (
                <>
                  <div className="flex-shrink-0 rounded-lg bg-accent-yellow/10 p-2">
                    <Zap className="h-4 w-4 text-accent-yellow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      Yellow Network (instant)
                    </p>
                    <p className="text-xs text-text-secondary">
                      {yellowConnecting && 'Connecting...'}
                      {yellowAuthenticated && status !== 'confirming' && 'Ready ✓'}
                      {status === 'confirming' && cctpStatus === 'idle' && 'Transferring...'}
                    </p>
                  </div>
                  {yellowAuthenticated && status !== 'confirming' && (
                    <CheckCircle2 className="h-4 w-4 text-accent-green flex-shrink-0" />
                  )}
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
                    <ArrowRightLeft className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      CCTP Bridge
                    </p>
                    <p className="text-xs text-text-secondary">
                      Sepolia → {recipient.preferredChain === 'arc' ? 'Arc' : recipient.preferredChain}
                      {cctpStatus !== 'idle' && cctpStatus !== 'complete' && cctpStatus !== 'failed' && (
                        <span className="ml-1">({CCTPStatusLabels[cctpStatus]})</span>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>

            {recipient.fastMode && recipient.preferredChain === 'arc' && (
              <div className="flex items-center gap-3 px-2 py-1 border-t border-border/50">
                <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    Settle to Arc
                  </p>
                  <p className="text-xs text-text-secondary">
                    {cctpStatus !== 'idle' && cctpStatus !== 'complete' && cctpStatus !== 'failed' 
                      ? `${CCTPStatusLabels[cctpStatus]}`
                      : 'Via CCTP bridge'}
                  </p>
                </div>
                {cctpStatus === 'complete' && (
                  <CheckCircle2 className="h-4 w-4 text-accent-green flex-shrink-0" />
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Error Messages */}
      {yellowError && recipient?.fastMode && (
        <Card variant="default" padding="sm" className="border-accent-red/20 bg-accent-red/5 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-accent-red flex-shrink-0" />
            <p className="text-sm text-accent-red">
              Yellow Network: {yellowError.message}
            </p>
          </div>
        </Card>
      )}

      {cctpError && (recipient?.preferredChain === 'arc' || !recipient?.fastMode) && (
        <Card variant="default" padding="sm" className="border-accent-red/20 bg-accent-red/5 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-accent-red flex-shrink-0" />
            <p className="text-sm text-accent-red">
              CCTP Settlement: {cctpError}
            </p>
          </div>
        </Card>
      )}

      {/* Submit Button */}
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
