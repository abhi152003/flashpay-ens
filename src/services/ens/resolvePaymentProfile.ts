import { createPublicClient, http } from 'viem';
import { normalize } from 'viem/ens';
import { sepolia } from 'viem/chains';
import { TEXT_RECORD_KEYS, DEFAULT_CHAIN, DEFAULT_TOKEN } from '@/config/ens';
import type { PaymentProfile, ChainPreference } from '@/types/ens';

const client = createPublicClient({
  chain: sepolia,
  transport: http(
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
      ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
      : undefined
  ),
});

export async function resolvePaymentProfile(ensName: string): Promise<PaymentProfile> {
  const normalizedName = normalize(ensName);
  
  const [address, preferredChain, token, fastMode, displayName] = await Promise.all([
    client.getEnsAddress({ name: normalizedName }),
    client.getEnsText({ name: normalizedName, key: TEXT_RECORD_KEYS.PREFERRED_CHAIN }),
    client.getEnsText({ name: normalizedName, key: TEXT_RECORD_KEYS.PREFERRED_TOKEN }),
    client.getEnsText({ name: normalizedName, key: TEXT_RECORD_KEYS.FAST_MODE }),
    client.getEnsText({ name: normalizedName, key: TEXT_RECORD_KEYS.DISPLAY_NAME }),
  ]);

  const validChains: ChainPreference[] = ['arc', 'ethereum', 'polygon', 'arbitrum'];
  const parsedChain = validChains.includes(preferredChain as ChainPreference)
    ? (preferredChain as ChainPreference)
    : DEFAULT_CHAIN;

  const validTokens = ['USDC', 'USDT', 'DAI'];
  const parsedToken = validTokens.includes(token || '')
    ? (token as 'USDC' | 'USDT' | 'DAI')
    : DEFAULT_TOKEN;

  return {
    ensName: normalizedName,
    resolvedAddress: address,
    displayName: displayName || null,
    preferredChain: parsedChain,
    preferredToken: parsedToken,
    token: parsedToken, // Backward compatibility
    fastMode: fastMode === 'true',
    rawRecords: {
      [TEXT_RECORD_KEYS.PREFERRED_CHAIN]: preferredChain,
      [TEXT_RECORD_KEYS.PREFERRED_TOKEN]: token,
      [TEXT_RECORD_KEYS.FAST_MODE]: fastMode,
      [TEXT_RECORD_KEYS.DISPLAY_NAME]: displayName,
    },
  };
}

export async function getEnsNameForAddress(address: `0x${string}`): Promise<string | null> {
  return client.getEnsName({ address });
}
