export type PaymentStatus = 'idle' | 'confirming' | 'pending' | 'success' | 'failed';
export type PaymentMode = 'fast' | 'onchain';
export type PaymentChain = 'sepolia' | 'arc' | 'unknown';

export interface Payment {
  id: string;
  recipientEns: string;
  recipientAddress: string;
  amount: string;
  mode: PaymentMode;
  status: PaymentStatus;
  createdAt: number;
  txHash?: string;
  chain?: PaymentChain;
}
