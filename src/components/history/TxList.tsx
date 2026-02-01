'use client';

import { useTxStore } from '@/hooks/useTxStore';
import { Zap, Globe, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Payment } from '@/types/payments';

function TxRow({ tx }: { tx: Payment }) {
  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
    idle: null,
    confirming: <Clock className="h-4 w-4 text-yellow-500" />,
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center gap-3">
        {tx.mode === 'fast' ? (
          <div className="rounded-full bg-yellow-500/20 p-2">
            <Zap className="h-4 w-4 text-yellow-500" />
          </div>
        ) : (
          <div className="rounded-full bg-blue-500/20 p-2">
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
        )}
        <div>
          <p className="font-medium text-white">{tx.recipientEns}</p>
          <p className="font-mono text-xs text-zinc-500">
            {tx.recipientAddress.slice(0, 6)}...{tx.recipientAddress.slice(-4)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-white">{tx.amount} USDC</p>
        <div className="flex items-center justify-end gap-1 text-xs text-zinc-500">
          {statusIcons[tx.status]}
          <span>{tx.status}</span>
        </div>
      </div>
    </div>
  );
}

export function TxList() {
  const { transactions } = useTxStore();

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">No transactions yet</p>
        <p className="mt-1 text-sm text-zinc-500">Your payment history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <TxRow key={tx.id} tx={tx} />
      ))}
    </div>
  );
}
