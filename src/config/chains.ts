import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Network Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
      webSocket: ['wss://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arcscan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
});

export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as const;

export const supportedChains = [arcTestnet, sepolia] as const;

export const chainLabels: Record<string, string> = {
  arc: 'Arc (Circle)',
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
};

// Token support by chain
export const chainTokenSupport: Record<string, string[]> = {
  arc: ['USDC'], // Arc only supports USDC (native currency)
  ethereum: ['USDC', 'USDT', 'DAI'],
  polygon: ['USDC', 'USDT', 'DAI'],
  arbitrum: ['USDC', 'USDT', 'DAI'],
};

export const CCTP_TOKEN_MESSENGER = '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA' as const;
export const CCTP_MESSAGE_TRANSMITTER = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275' as const;

export const SEPOLIA_USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const;

export const CCTP_DOMAINS = {
  'ethereum-sepolia': 0,
  'avalanche-fuji': 1,
  'op-sepolia': 2,
  'arbitrum-sepolia': 3,
  'base-sepolia': 6,
  'polygon-amoy': 7,
  'arc-testnet': 26,
} as const;

export const CIRCLE_ATTESTATION_API = 'https://iris-api-sandbox.circle.com';
