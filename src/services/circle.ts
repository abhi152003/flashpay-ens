export interface CircleTransfer {
  transferId: string;
  status: 'pending' | 'complete' | 'failed';
  txHash?: string;
}

export async function initiateSettlement(_params: {
  recipientAddress: string;
  amount: string;
  targetChain: string;
}): Promise<CircleTransfer> {
  await new Promise((r) => setTimeout(r, 1200));
  return {
    transferId: `circle-${Date.now()}`,
    status: 'pending',
  };
}

export async function getTransferStatus(transferId: string): Promise<CircleTransfer> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    transferId,
    status: 'complete',
    txHash: `0x${Math.random().toString(16).slice(2)}`,
  };
}
