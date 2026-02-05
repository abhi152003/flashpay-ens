'use client';

import { useAccount, useBalance, useChainId } from 'wagmi';
import { arcTestnet, ARC_USDC_ADDRESS } from '@/config/chains';
import { sepolia } from 'wagmi/chains';

export const SEPOLIA_USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const;

export interface USDCBalance {
  balance: string;
  formatted: string;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  chainName: string;
  chainId: number;
}

export function useArcBalance(): USDCBalance {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const isArc = chainId === arcTestnet.id;
  const isSepolia = chainId === sepolia.id;

  const tokenAddress = isSepolia ? SEPOLIA_USDC_ADDRESS : undefined;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useBalance({
    address,
    token: tokenAddress,
    chainId: chainId,
    query: {
      enabled: Boolean(address && isConnected),
    },
  });

  const balance = data?.formatted ?? '0';

  const formatted = parseFloat(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const chainName = isArc ? 'Arc' : isSepolia ? 'Sepolia' : 'Unknown';

  return {
    balance,
    formatted,
    isLoading,
    error: error as Error | null,
    refetch,
    chainName,
    chainId,
  };
}
