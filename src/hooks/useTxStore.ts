'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Payment } from '@/types/payments';

const STORAGE_KEY = 'flashpay-transactions';

let cachedTransactions: Payment[] = [];

function getSnapshot(): Payment[] {
  return cachedTransactions;
}

function getServerSnapshot(): Payment[] {
  return [];
}

function subscribe(onStoreChange: () => void): () => void {
  function handleStorage() {
    loadFromStorage();
    onStoreChange();
  }
  window.addEventListener('storage', handleStorage);
  loadFromStorage();
  onStoreChange();
  return () => window.removeEventListener('storage', handleStorage);
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    cachedTransactions = stored ? JSON.parse(stored) : [];
  } catch {
    cachedTransactions = [];
  }
}

function saveToStorage(transactions: Payment[]) {
  cachedTransactions = transactions;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function useTxStore() {
  const transactions = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addTransaction = useCallback((tx: Payment) => {
    const updated = [tx, ...cachedTransactions];
    saveToStorage(updated);
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Payment>) => {
    const updated = cachedTransactions.map((tx) =>
      tx.id === id ? { ...tx, ...updates } : tx
    );
    saveToStorage(updated);
  }, []);

  return { transactions, addTransaction, updateTransaction };
}
