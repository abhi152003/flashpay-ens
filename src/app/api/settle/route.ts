import { NextRequest, NextResponse } from 'next/server';

interface SettleRequest {
  recipientAddress: string;
  amount: string;
  targetChain: string;
}

export async function POST(request: NextRequest) {
  const body: SettleRequest = await request.json();

  const { recipientAddress, amount, targetChain } = body;

  if (!recipientAddress || !amount || !targetChain) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  await new Promise((r) => setTimeout(r, 1000));

  return NextResponse.json({
    transferId: `circle-${Date.now()}`,
    status: 'pending',
  });
}
