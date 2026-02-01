'use client';

import { TxList } from '@/components/history/TxList';

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="mt-1 text-zinc-400">
          Your recent FlashPay transactions
        </p>
      </div>

      <TxList />
    </div>
  );
}
