import { sepolia } from 'wagmi/chains';

export const supportedChains = [sepolia] as const;

export const chainLabels: Record<string, string> = {
  arc: 'Arc (Circle)',
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
};
