'use client';

import { TxList } from '@/components/history/TxList';

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 md:space-y-8 animate-fade-in">
      <div className="space-y-2 md:space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-text-primary">
          Transaction History
        </h1>
        <p className="text-base md:text-lg text-text-secondary">
          Your recent FlashPay transactions
        </p>
      </div>

      <TxList />
    </div>
  );
}
