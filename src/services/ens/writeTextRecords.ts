import { namehash } from 'viem/ens';

export const ENS_PUBLIC_RESOLVER_ABI = [
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
] as const;

export const ENS_REGISTRY_ABI = [
  {
    name: 'resolver',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

export const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as const;

export function getNamehash(name: string): `0x${string}` {
  return namehash(name);
}

export interface TextRecordWrite {
  key: string;
  value: string;
}
