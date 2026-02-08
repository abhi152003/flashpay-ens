'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import type { Payment } from '@/types/payments';

export function useTxStore() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions when wallet address changes
  useEffect(() => {
    if (!address) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/transactions?walletAddress=${address}`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address]);

  const addTransaction = useCallback(async (tx: Payment) => {
    if (!address) {
      console.error('No wallet address connected');
      return;
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tx,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        const newTx = await response.json();
        setTransactions((prev) => [newTx, ...prev]);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }, [address]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Payment>) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTx = await response.json();
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === id ? updatedTx : tx))
        );
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  }, []);

  return { transactions, addTransaction, updateTransaction, loading };
}
