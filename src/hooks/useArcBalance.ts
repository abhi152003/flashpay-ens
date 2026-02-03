'use client';

import { useAccount, useBalance } from 'wagmi';
import { arcTestnet } from '@/config/chains';

export interface ArcBalance {
  balance: string;
  formatted: string;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useArcBalance(): ArcBalance {
  const { address, isConnected } = useAccount();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useBalance({
    address,
    chainId: arcTestnet.id,
    query: {
      enabled: Boolean(address && isConnected),
    },
  });

  const balance = data?.formatted ?? '0';

  const formatted = parseFloat(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    balance,
    formatted,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
