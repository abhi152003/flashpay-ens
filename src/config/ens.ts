export const TEXT_RECORD_KEYS = {
  PREFERRED_CHAIN: 'xyz.flashpay.chain',
  PREFERRED_TOKEN: 'xyz.flashpay.token',
  FAST_MODE: 'xyz.flashpay.fastMode',
  DISPLAY_NAME: 'xyz.flashpay.displayName',
  SPLIT_RULES: 'xyz.flashpay.split',
} as const;

export const CHAIN_OPTIONS = ['arc', 'ethereum', 'polygon', 'arbitrum'] as const;
export const DEFAULT_CHAIN = 'ethereum';
export const DEFAULT_TOKEN = 'USDC';
