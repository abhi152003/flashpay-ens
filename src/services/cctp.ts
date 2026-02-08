import { encodeFunctionData, type Address, type Hex, pad, createPublicClient, http } from 'viem';
import {
    CCTP_TOKEN_MESSENGER,
    SEPOLIA_USDC_ADDRESS,
    CCTP_DOMAINS,
    CIRCLE_ATTESTATION_API,
} from '@/config/chains';
import { sepolia } from 'wagmi/chains';
import type { WalletClient } from 'viem';

// Create a public client for reading transaction receipts
const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});

const USDC_APPROVE_ABI = [
    {
        type: 'function',
        name: 'approve',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
] as const;

const TOKEN_MESSENGER_ABI = [
    {
        type: 'function',
        name: 'depositForBurn',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'amount', type: 'uint256' },
            { name: 'destinationDomain', type: 'uint32' },
            { name: 'mintRecipient', type: 'bytes32' },
            { name: 'burnToken', type: 'address' },
            { name: 'destinationCaller', type: 'bytes32' },
            { name: 'maxFee', type: 'uint256' },
            { name: 'minFinalityThreshold', type: 'uint32' },
        ],
        outputs: [],
    },
] as const;

interface AttestationMessage {
    message: string;
    attestation: string;
    status: 'pending' | 'complete';
}

interface AttestationResponse {
    messages: AttestationMessage[];
}

export interface CCTPBridgeResult {
    status: 'success' | 'failed';
    burnTxHash?: string;
    mintTxHash?: string;
    error?: string;
}

export interface CCTPBridgeCallbacks {
    onApproving?: () => void;
    onBurning?: () => void;
    onWaitingAttestation?: () => void;
    onMinting?: () => void;
    onComplete?: () => void;
}

function addressToBytes32(address: Address): Hex {
    return pad(address, { size: 32 });
}

async function approveUSDC(
    walletClient: WalletClient,
    amount: bigint
): Promise<Hex> {
    const data = encodeFunctionData({
        abi: USDC_APPROVE_ABI,
        functionName: 'approve',
        args: [CCTP_TOKEN_MESSENGER, amount],
    });

    const txHash = await walletClient.sendTransaction({
        to: SEPOLIA_USDC_ADDRESS,
        data,
        chain: sepolia,
        account: walletClient.account!,
        gas: BigInt(100000),
    });

    // Wait for approval transaction confirmation
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return txHash;
}

const DEFAULT_FAST_TRANSFER_MAX_FEE = BigInt(500);

async function burnUSDC(
    walletClient: WalletClient,
    amount: bigint,
    destinationAddress: Address,
    maxFee: bigint = DEFAULT_FAST_TRANSFER_MAX_FEE
): Promise<Hex> {
    const destinationDomain = CCTP_DOMAINS['arc-testnet'];
    const mintRecipient = addressToBytes32(destinationAddress);
    const destinationCaller = addressToBytes32('0x0000000000000000000000000000000000000000' as Address);

    const data = encodeFunctionData({
        abi: TOKEN_MESSENGER_ABI,
        functionName: 'depositForBurn',
        args: [
            amount,
            destinationDomain,
            mintRecipient,
            SEPOLIA_USDC_ADDRESS,
            destinationCaller,
            maxFee,
            1000,
        ],
    });

    const txHash = await walletClient.sendTransaction({
        to: CCTP_TOKEN_MESSENGER,
        data,
        chain: sepolia,
        account: walletClient.account!,
        gas: BigInt(300000),
    });

    return txHash;
}

const ATTESTATION_MAX_RETRIES = 120;
const ATTESTATION_RETRY_INTERVAL_MS = 5000;

async function retrieveAttestation(
    burnTxHash: string,
    maxRetries: number = ATTESTATION_MAX_RETRIES,
    retryIntervalMs: number = ATTESTATION_RETRY_INTERVAL_MS
): Promise<AttestationMessage> {
    const sourceDomain = CCTP_DOMAINS['ethereum-sepolia'];
    const url = `${CIRCLE_ATTESTATION_API}/v2/messages/${sourceDomain}?transactionHash=${burnTxHash}`;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`⏳ Message not found yet (attempt ${i + 1}/${maxRetries})`);
                } else {
                    console.warn(`Attestation API error: ${response.status} ${response.statusText}`);
                } 
                await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
                continue;
            }

            const data = await response.json() as AttestationResponse;
            const firstMessage = data.messages?.[0];

            if (firstMessage?.status === 'complete') {
                return firstMessage;
            }

            await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
        }
    }

    throw new Error('Attestation timeout - max retries exceeded');
}

async function settleOnArc(
    attestation: AttestationMessage
): Promise<string> {
    const response = await fetch('/api/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: attestation.message,
            attestation: attestation.attestation,
        }),
    });

    const result = await response.json();

    if (!response.ok || result.status === 'failed') {
        throw new Error(result.error || 'Settlement failed on Arc');
    }

    return result.mintTxHash;
}

export async function bridgeUSDCToArc(
    walletClient: WalletClient,
    amount: string,
    destinationAddress: Address,
    callbacks?: CCTPBridgeCallbacks
): Promise<CCTPBridgeResult> {
    try {
        const amountInSmallestUnits = BigInt(Math.floor(parseFloat(amount) * 1_000_000));

        callbacks?.onApproving?.();
        await approveUSDC(walletClient, amountInSmallestUnits);

        callbacks?.onBurning?.();
        const burnTxHash = await burnUSDC(walletClient, amountInSmallestUnits, destinationAddress);

        callbacks?.onWaitingAttestation?.();
        const attestation = await retrieveAttestation(burnTxHash);

        callbacks?.onMinting?.();
        const mintTxHash = await settleOnArc(attestation);

        callbacks?.onComplete?.();

        return {
            status: 'success',
            burnTxHash,
            mintTxHash,
        };
    } catch (error) {
        return {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function getCCTPBridgeStatus(burnTxHash: string): Promise<{
    status: 'pending' | 'ready' | 'error';
    attestation?: AttestationMessage;
}> {
    const sourceDomain = CCTP_DOMAINS['ethereum-sepolia'];
    const url = `${CIRCLE_ATTESTATION_API}/v2/messages/${sourceDomain}?transactionHash=${burnTxHash}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return { status: 'pending' };
        }

        const data = await response.json() as AttestationResponse;

        if (data.messages?.[0]?.status === 'complete') {
            return { status: 'ready', attestation: data.messages[0] };
        }

        return { status: 'pending' };
    } catch {
        return { status: 'error' };
    }
}
