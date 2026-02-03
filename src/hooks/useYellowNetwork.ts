'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { getYellowClient, type YellowTransfer, type YellowBalance } from '@/services/yellow';
import type { Address } from 'viem';

export interface UseYellowNetworkReturn {
  isConnected: boolean;
  isAuthenticated: boolean;
  isConnecting: boolean;
  error: Error | null;
  balances: YellowBalance[];
  connect: () => Promise<void>;
  disconnect: () => void;
  transfer: (to: Address, amount: string) => Promise<YellowTransfer>;
  refreshBalances: () => Promise<void>;
}

export function useYellowNetwork(): UseYellowNetworkReturn {
  const { address, isConnected: walletConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [balances, setBalances] = useState<YellowBalance[]>([]);

  const connect = useCallback(async () => {
    if (!address || !walletConnected || !walletClient) {
      setError(new Error('Wallet not connected'));
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const client = getYellowClient();
      
      // Connect to WebSocket
      await client.connect();
      setIsConnected(true);

      // Authenticate with EIP-712 signature using wallet client
      await client.authenticate(address, walletClient);
      
      setIsAuthenticated(true);

      // Fetch initial balances
      const fetchedBalances = await client.getBalances();
      setBalances(fetchedBalances);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to Yellow Network');
      setError(error);
      console.error('Yellow Network connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [address, walletConnected, walletClient]);

  const disconnect = useCallback(() => {
    const client = getYellowClient();
    client.disconnect();
    setIsConnected(false);
    setIsAuthenticated(false);
    setBalances([]);
  }, []);

  const transfer = useCallback(async (to: Address, amount: string): Promise<YellowTransfer> => {
    const client = getYellowClient();
    
    if (!client.authenticated) {
      throw new Error('Not authenticated to Yellow Network');
    }

    return client.transfer({ to, amount, asset: 'usdc' });
  }, []);

  const refreshBalances = useCallback(async () => {
    const client = getYellowClient();
    
    if (!client.authenticated) {
      return;
    }

    try {
      const fetchedBalances = await client.getBalances();
      setBalances(fetchedBalances);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    }
  }, []);

  // Auto-disconnect when wallet disconnects
  useEffect(() => {
    if (!walletConnected && isConnected) {
      disconnect();
    }
  }, [walletConnected, isConnected, disconnect]);

  return {
    isConnected,
    isAuthenticated,
    isConnecting,
    error,
    balances,
    connect,
    disconnect,
    transfer,
    refreshBalances,
  };
}
