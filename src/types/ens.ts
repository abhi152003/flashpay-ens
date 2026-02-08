export type ChainPreference = 'arc' | 'ethereum' | 'polygon' | 'arbitrum';
export type TokenPreference = 'USDC' | 'USDT' | 'DAI';

export interface PaymentProfile {
  ensName: string;
  resolvedAddress: `0x${string}` | null;
  displayName: string | null;
  preferredChain: ChainPreference;
  preferredToken: TokenPreference;
  token: TokenPreference; // Deprecated, use preferredToken
  fastMode: boolean;
  rawRecords: Record<string, string | null>;
}

export interface TextRecordUpdate {
  key: string;
  value: string;
}
