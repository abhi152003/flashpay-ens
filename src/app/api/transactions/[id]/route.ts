import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/transactions/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, txHash, chain } = body;

    const transaction = await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        ...(status && { status }),
        ...(txHash !== undefined && { txHash }),
        ...(chain !== undefined && { chain }),
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
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
