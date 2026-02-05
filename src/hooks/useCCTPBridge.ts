'use client';

import { useState, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { bridgeUSDCToArc, type CCTPBridgeResult } from '@/services/cctp';
import type { Address } from 'viem';

export type CCTPBridgeStatus =
    | 'idle'
    | 'approving'
    | 'burning'
    | 'waiting_attestation'
    | 'settling'
    | 'complete'
    | 'failed';

export interface UseCCTPBridgeReturn {
    status: CCTPBridgeStatus;
    result: CCTPBridgeResult | null;
    error: string | null;
    bridge: (amount: string, destinationAddress: Address) => Promise<CCTPBridgeResult>;
    reset: () => void;
}

export function useCCTPBridge(): UseCCTPBridgeReturn {
    const { data: walletClient } = useWalletClient();
    const [status, setStatus] = useState<CCTPBridgeStatus>('idle');
    const [result, setResult] = useState<CCTPBridgeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const bridge = useCallback(async (
        amount: string,
        destinationAddress: Address
    ): Promise<CCTPBridgeResult> => {
        if (!walletClient) {
            const err = 'Wallet not connected';
            setError(err);
            setStatus('failed');
            return { status: 'failed', error: err };
        }

        setError(null);
        setStatus('approving');

        const bridgeResult = await bridgeUSDCToArc(
            walletClient,
            amount,
            destinationAddress,
            {
                onApproving: () => setStatus('approving'),
                onBurning: () => setStatus('burning'),
                onWaitingAttestation: () => setStatus('waiting_attestation'),
                onMinting: () => setStatus('settling'),
                onComplete: () => setStatus('complete'),
            }
        );

        if (bridgeResult.status === 'failed') {
            setError(bridgeResult.error || 'Bridge failed');
            setStatus('failed');
        }

        setResult(bridgeResult);
        return bridgeResult;
    }, [walletClient]);

    const reset = useCallback(() => {
        setStatus('idle');
        setResult(null);
        setError(null);
    }, []);

    return {
        status,
        result,
        error,
        bridge,
        reset,
    };
}

export const CCTPStatusLabels: Record<CCTPBridgeStatus, string> = {
    idle: 'Ready',
    approving: 'Approving USDC...',
    burning: 'Burning on Sepolia...',
    waiting_attestation: 'Waiting for Circle attestation...',
    settling: 'Settling on Arc...',
    complete: 'Bridge complete!',
    failed: 'Bridge failed',
};
