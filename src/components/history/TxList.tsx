'use client';

import { useTxStore } from '@/hooks/useTxStore';
import { Zap, Globe, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Payment } from '@/types/payments';

function TxRow({ tx }: { tx: Payment }) {
  const statusConfig = {
    pending: {
      icon: <Clock className="h-4 w-4 text-accent-yellow" />,
      text: 'Pending',
      color: 'text-accent-yellow',
      bg: 'bg-accent-yellow/10',
    },
    success: {
      icon: <CheckCircle className="h-4 w-4 text-accent-green" />,
      text: 'Complete',
      color: 'text-accent-green',
      bg: 'bg-accent-green/10',
    },
    failed: {
      icon: <XCircle className="h-4 w-4 text-accent-red" />,
      text: 'Failed',
      color: 'text-accent-red',
      bg: 'bg-accent-red/10',
    },
    idle: {
      icon: null,
      text: 'Idle',
      color: 'text-text-tertiary',
      bg: 'bg-border',
    },
    confirming: {
      icon: <Clock className="h-4 w-4 text-accent-yellow animate-pulse" />,
      text: 'Confirming',
      color: 'text-accent-yellow',
      bg: 'bg-accent-yellow/10',
    },
  };

  const status = statusConfig[tx.status];
  const modeConfig = tx.mode === 'fast' 
    ? { icon: Zap, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', label: 'Fast' }
    : { icon: Globe, color: 'text-primary', bg: 'bg-primary/10', label: 'Bridge' };

  const Icon = modeConfig.icon;

  return (
    <Card variant="interactive" padding="md" className="group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mode Icon + Recipient Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`flex-shrink-0 rounded-xl p-2 sm:p-2.5 ${modeConfig.bg} transition-transform duration-200 group-hover:scale-110`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${modeConfig.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-text-primary truncate text-sm sm:text-base">
              {tx.recipientEns}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="font-mono">
                {tx.recipientAddress.slice(0, 6)}...{tx.recipientAddress.slice(-4)}
              </span>
              <span className="text-text-tertiary">•</span>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full ${modeConfig.bg} ${modeConfig.color} font-medium`}>
                {modeConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Amount + Status */}
        <div className="flex items-center justify-between sm:text-right sm:flex-shrink-0 sm:flex-col sm:items-end gap-2">
          <p className="font-display font-semibold text-base sm:text-lg text-text-primary">
            {tx.amount} <span className="text-xs sm:text-sm text-text-secondary">USDC</span>
          </p>
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg} text-xs font-medium ${status.color}`}>
            {status.icon}
            <span>{status.text}</span>
          </div>
        </div>
      </div>

      {/* Transaction Hash Link (if available) */}
      {tx.txHash && tx.status === 'success' && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <a
            href={
              tx.chain === 'arc'
                ? `https://testnet.arcscan.app/tx/${tx.txHash}`
                : `https://sepolia.etherscan.io/tx/${tx.txHash}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors duration-200"
          >
            <span>
              View on {tx.chain === 'arc' ? 'Arcscan' : 'Etherscan'}
            </span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </Card>
  );
}

export function TxList() {
  const { transactions, loading } = useTxStore();

  if (loading) {
    return (
      <Card variant="elevated" padding="lg" className="text-center space-y-3 animate-fade-in">
        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface-elevated flex items-center justify-center">
          <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-text-tertiary animate-pulse" />
        </div>
        <div>
          <p className="font-display font-semibold text-text-primary text-base sm:text-lg">
            Loading transactions...
          </p>
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card variant="elevated" padding="lg" className="text-center space-y-3 animate-fade-in">
        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface-elevated flex items-center justify-center">
          <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-text-tertiary" />
        </div>
        <div>
          <p className="font-display font-semibold text-text-primary text-base sm:text-lg">
            No transactions yet
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Your payment history will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {transactions.map((tx, index) => (
        <div key={tx.id} className={`stagger-${Math.min(index + 1, 4)}`}>
          <TxRow tx={tx} />
        </div>
      ))}
    </div>
  );
}
