export interface YellowSession {
  sessionId: string;
  status: 'active' | 'pending' | 'closed';
}

export interface YellowTransfer {
  transferId: string;
  status: 'pending' | 'complete' | 'failed';
}

export async function initSession(): Promise<YellowSession> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    sessionId: `yellow-${Date.now()}`,
    status: 'active',
  };
}

export async function sendOffchainUSDC(_params: {
  to: string;
  amount: string;
}): Promise<YellowTransfer> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    transferId: `ytx-${Date.now()}`,
    status: 'complete',
  };
}

export async function settleChannel(_sessionId: string): Promise<{
  txHash: string;
  status: 'settled';
}> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    txHash: `0x${Math.random().toString(16).slice(2)}`,
    status: 'settled',
  };
}
