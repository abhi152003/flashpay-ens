import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/transactions?walletAddress=0x...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        walletAddress: walletAddress.toLowerCase(),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match Payment interface
    const payments = transactions.map((tx) => ({
      id: tx.id,
      recipientEns: tx.recipientEns,
      recipientAddress: tx.recipientAddress,
      amount: tx.amount,
      mode: tx.mode as 'fast' | 'onchain',
      status: tx.status as 'idle' | 'confirming' | 'pending' | 'success' | 'failed',
      createdAt: tx.createdAt.getTime(),
      txHash: tx.txHash || undefined,
      chain: (tx.chain as 'sepolia' | 'arc' | 'unknown') || undefined,
    }));

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      recipientEns, 
      recipientAddress, 
      amount, 
      mode, 
      status, 
      walletAddress,
      txHash,
      chain
    } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        id: id || undefined,
        recipientEns,
        recipientAddress,
        amount,
        mode,
        status,
        walletAddress: walletAddress.toLowerCase(),
        txHash: txHash || null,
        chain: chain || null,
      },
    });

    return NextResponse.json({
      id: transaction.id,
      recipientEns: transaction.recipientEns,
      recipientAddress: transaction.recipientAddress,
      amount: transaction.amount,
      mode: transaction.mode,
      status: transaction.status,
      createdAt: transaction.createdAt.getTime(),
      txHash: transaction.txHash || undefined,
      chain: transaction.chain || undefined,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
