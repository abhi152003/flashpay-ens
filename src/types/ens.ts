export type ChainPreference = 'arc' | 'ethereum' | 'polygon' | 'arbitrum';
export type TokenPreference = 'USDC';

export interface PaymentProfile {
  ensName: string;
  resolvedAddress: `0x${string}` | null;
  displayName: string | null;
  preferredChain: ChainPreference;
  token: TokenPreference;
  fastMode: boolean;
  rawRecords: Record<string, string | null>;
}

export interface TextRecordUpdate {
  key: string;
  value: string;
}
