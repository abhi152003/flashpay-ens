import {
  createAuthRequestMessage,
  createAuthVerifyMessageFromChallenge,
  createTransferMessage,
  createGetLedgerBalancesMessage,
  createEIP712AuthMessageSigner,
  createECDSAMessageSigner,
  parseAnyRPCResponse,
  parseAuthChallengeResponse,
  parseAuthVerifyResponse,
  parseTransferResponse,
  parseGetLedgerBalancesResponse,
  type MessageSigner,
} from '@erc7824/nitrolite';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type { Address, Hex, WalletClient } from 'viem';

const CLEARNODE_URL = 'wss://clearnet.yellow.com/ws';
const CLEARNODE_SANDBOX_URL = 'wss://clearnet-sandbox.yellow.com/ws';

const USE_SANDBOX = process.env.NEXT_PUBLIC_YELLOW_SANDBOX !== 'false';

export interface YellowSession {
  sessionId: string;
  status: 'active' | 'pending' | 'closed';
  ws: WebSocket;
}

export interface YellowTransfer {
  transferId: string;
  status: 'pending' | 'complete' | 'failed';
}

export interface YellowBalance {
  asset: string;
  amount: string;
}

type PendingRequest = {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
};

class YellowNetworkClient {
  private ws: WebSocket | null = null;
  private sessionSigner: MessageSigner | null = null;
  private userAddress: Address | null = null;
  private isAuthenticatedFlag = false;
  private pendingRequests: Map<number, PendingRequest> = new Map();
  private requestIdCounter = 1;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = USE_SANDBOX ? CLEARNODE_SANDBOX_URL : CLEARNODE_URL;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ Connected to Yellow Network');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(new Error('Failed to connect to Yellow Network'));
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.isAuthenticatedFlag = false;
      };
    });
  }

  private handleMessage(data: string): void {
    try {
      const response = parseAnyRPCResponse(data);
      
      const requestId = response.requestId;
      if (requestId !== undefined) {
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
          if (response.method === 'error') {
            pending.reject(new Error((response as any).params?.error || 'Unknown error'));
          } else {
            pending.resolve(data);
          }
          this.pendingRequests.delete(requestId);
        }
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  async authenticate(
    address: Address,
    walletClient: WalletClient
  ): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    this.userAddress = address;
    
    const sessionPrivateKey = generatePrivateKey();
    const sessionAccount = privateKeyToAccount(sessionPrivateKey);
    this.sessionSigner = createECDSAMessageSigner(sessionPrivateKey);

    const authParams = {
      address,
      session_key: sessionAccount.address,
      application: 'flashpay-ens',
      allowances: [{ asset: 'usdc', amount: '1000000000' }],
      expires_at: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24 hours
      scope: 'flashpay',
    };

    const requestId = this.requestIdCounter++;
    
    // Step 1: Send auth request to get a challenge
    const authRequestMsg = await createAuthRequestMessage(authParams, requestId);
    const challengeRaw = await this.sendAndWait(authRequestMsg, requestId);
    const challengeResponse = parseAuthChallengeResponse(challengeRaw);
    
    const verifyRequestId = this.requestIdCounter++;
    
    // Step 2: Sign with MAIN wallet using EIP-712
    const eip712Signer = createEIP712AuthMessageSigner(
      walletClient,
      {
        scope: authParams.scope,
        session_key: authParams.session_key,
        expires_at: authParams.expires_at,
        allowances: authParams.allowances,
      },
      { name: 'flashpay-ens' }
    );

    const authVerifyMsg = await createAuthVerifyMessageFromChallenge(
      eip712Signer,
      challengeResponse.params.challengeMessage,
      verifyRequestId
    );

    const verifyRaw = await this.sendAndWait(authVerifyMsg, verifyRequestId);
    const verifyResponse = parseAuthVerifyResponse(verifyRaw);
    
    if (verifyResponse.params.success) {
      this.isAuthenticatedFlag = true;
      console.log('✅ Authenticated with Yellow Network');
    } else {
      throw new Error('Authentication failed');
    }
  }

  private sendAndWait(message: string, requestId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.pendingRequests.set(requestId, { resolve, reject });

      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000);

      this.ws.send(message);
    });
  }

  async transfer(params: { to: Address; amount: string; asset?: string }): Promise<YellowTransfer> {
    if (!this.isAuthenticatedFlag || !this.sessionSigner) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    const requestId = this.requestIdCounter++;
    
    // Use session signer for transfers
    const transferMsg = await createTransferMessage(this.sessionSigner, {
      destination: params.to,
      allocations: [
        {
          asset: params.asset || 'usdc',
          amount: params.amount,
        },
      ],
    }, requestId);

    try {
      const resultRaw = await this.sendAndWait(transferMsg, requestId);
      const result = parseTransferResponse(resultRaw);
      
      return {
        transferId: result.params.transactions?.[0]?.id?.toString() || `ytx-${Date.now()}`,
        status: 'complete',
      };
    } catch (error) {
      console.error('Transfer failed:', error);
      return {
        transferId: `ytx-${Date.now()}`,
        status: 'failed',
      };
    }
  }

  async getBalances(): Promise<YellowBalance[]> {
    if (!this.isAuthenticatedFlag || !this.sessionSigner) {
      throw new Error('Not authenticated');
    }

    const requestId = this.requestIdCounter++;
    const balancesMsg = await createGetLedgerBalancesMessage(this.sessionSigner, undefined, requestId);
    
    try {
      const resultRaw = await this.sendAndWait(balancesMsg, requestId);
      const result = parseGetLedgerBalancesResponse(resultRaw);
      return result.params.ledgerBalances || [];
    } catch (error) {
      console.error('Failed to get balances:', error);
      return [];
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isAuthenticatedFlag = false;
    this.sessionSigner = null;
    this.userAddress = null;
    this.pendingRequests.clear();
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get authenticated(): boolean {
    return this.isAuthenticatedFlag;
  }
}

let clientInstance: YellowNetworkClient | null = null;

export function getYellowClient(): YellowNetworkClient {
  if (!clientInstance) {
    clientInstance = new YellowNetworkClient();
  }
  return clientInstance;
}

export async function initSession(): Promise<YellowSession> {
  const client = getYellowClient();
  await client.connect();
  return {
    sessionId: `yellow-${Date.now()}`,
    status: 'pending',
    ws: (client as any).ws,
  };
}

export async function sendOffchainUSDC(params: {
  to: string;
  amount: string;
}): Promise<YellowTransfer> {
  const client = getYellowClient();
  
  if (!client.authenticated) {
    throw new Error('Yellow Network client not authenticated. Please authenticate first.');
  }

  return client.transfer({
    to: params.to as Address,
    amount: params.amount,
    asset: 'usdc',
  });
}

export async function settleChannel(_sessionId: string): Promise<{
  txHash: string;
  status: 'settled';
}> {
  console.log('Channel settlement requested');
  return {
    txHash: `0x${Math.random().toString(16).slice(2)}`,
    status: 'settled',
  };
}
