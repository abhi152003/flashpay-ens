import { NextRequest, NextResponse } from 'next/server';
import {
    createWalletClient,
    createPublicClient,
    http,
    encodeFunctionData,
    type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
    CCTP_MESSAGE_TRANSMITTER,
    arcTestnet,
} from '@/config/chains';

const MESSAGE_TRANSMITTER_ABI = [
    {
        type: 'function',
        name: 'receiveMessage',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'message', type: 'bytes' },
            { name: 'attestation', type: 'bytes' },
        ],
        outputs: [],
    },
] as const;

interface SettleRequest {
    message: string;
    attestation: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: SettleRequest = await request.json();
        const { message, attestation } = body;

        if (!message || !attestation) {
            return NextResponse.json(
                { error: 'Missing required fields: message, attestation' },
                { status: 400 }
            );
        }

        const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
        if (!relayerPrivateKey) {
            return NextResponse.json(
                { error: 'Settlement service not configured' },
                { status: 503 }
            );
        }

        const account = privateKeyToAccount(
            relayerPrivateKey.startsWith('0x')
                ? relayerPrivateKey as Hex
                : `0x${relayerPrivateKey}` as Hex
        );

        const walletClient = createWalletClient({
            account,
            chain: arcTestnet,
            transport: http(),
        });

        const publicClient = createPublicClient({
            chain: arcTestnet,
            transport: http(),
        });


        const data = encodeFunctionData({
            abi: MESSAGE_TRANSMITTER_ABI,
            functionName: 'receiveMessage',
            args: [message as Hex, attestation as Hex],
        });

        const txHash = await walletClient.sendTransaction({
            to: CCTP_MESSAGE_TRANSMITTER,
            data,
            gas: BigInt(300000),
        });


        const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
            timeout: 60_000,
        });

        const isSuccess = receipt.status === 'success';

        return NextResponse.json({
            status: isSuccess ? 'success' : 'failed',
            mintTxHash: txHash,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Settlement failed:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
