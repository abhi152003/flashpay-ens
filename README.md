# FlashPay.ens 🚀

**Send crypto to any ENS name in their preferred token, on their preferred chain. Gasless. Instant. Seamless.**

## The Problem

Sending crypto today is fragmented and painful:
- 📝 **Complex addresses**: Users need to remember or copy 42-character hex addresses
- 💸 **Wrong network**: Sending to the wrong chain = lost funds
- 🪙 **Wrong token**: Recipients want USDC, but you sent USDT
- ⛽ **Gas fees**: Every transaction costs gas, making small payments impractical
- ⏰ **Slow settlements**: Cross-chain transfers take minutes to hours
- 🤷 **Recipient preferences unknown**: No way to know how someone prefers to receive payments

## The Solution: FlashPay.ens

FlashPay leverages three powerful Web3 protocols to create a seamless payment experience:

```
User enters "vitalik.eth" → ENS resolves preferences → Yellow Network (instant, gasless) 
→ CCTP bridges to Arc → Recipient gets USDC on Arc (their preferred chain)
```

### How It Works

1. **Enter .eth name** - No more copying addresses
2. **Auto-fetch preferences** - ENS tells us recipient's preferred chain and token
3. **Instant transfer** - Yellow Network state channels = zero gas fees
4. **Cross-chain settlement** - CCTP bridges USDC to recipient's preferred chain
5. **Done!** - Recipient gets exactly what they want, where they want it

---

## Protocol Integration

### 1. 🏷️ ENS (Ethereum Name Service)
**Role:** User identity and payment preferences storage

**What it does:**
- Resolves `.eth` names to wallet addresses (vitalik.eth → 0x123...)
- Stores payment preferences in ENS text records:
  - `eth.flashpay.chain` - Preferred settlement chain (arc, ethereum, polygon, arbitrum)
  - `eth.flashpay.token` - Preferred token (USDC, USDT, DAI)
  - `eth.flashpay.fast` - Enable gasless payments via Yellow Network
  - `eth.flashpay.display` - Display name

**Why it matters:** Recipients control how they want to receive payments. Senders don't need to ask or guess.

---

### 2. ⚡ Yellow Network
**Role:** Gasless instant transfers via state channels

**What it does:**
- Uses Nitro state channels (ERC-7824) for off-chain transfers
- Instant settlements (sub-second)
- Zero gas fees for both sender and recipient
- Secured by Ethereum smart contracts

**Why it matters:** Makes micropayments viable and eliminates gas fee friction. Users pay nothing to send money.

**How it works:**
1. Authenticate with Yellow ClearNode using EIP-712 signature
2. Open state channel
3. Transfer happens off-chain instantly
4. Settle to any blockchain when needed

---

### 3. 🌉 Arc Network + CCTP
**Role:** Cross-chain USDC settlement to recipient's preferred chain

**What it does:**
- **Arc Network**: USDC-native blockchain (USDC is the gas token)
- **CCTP (Circle's Cross-Chain Transfer Protocol)**: Bridge native USDC across chains

**Why it matters:** 
- Recipients get USDC on their preferred chain without wrapped tokens
- Arc's USDC-native design = lowest cost for stablecoin transactions
- Circle's official bridge = secure, native USDC (not wrapped)

**How it works:**
1. Burn USDC on Sepolia (source chain)
2. Get attestation from Circle's API
3. Relayer mints USDC on Arc (destination chain)
4. No wrapped tokens, no liquidity pools, just native USDC

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FlashPay Frontend                      │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   ENS    │  │    Yellow    │  │    CCTP + Arc       │  │
│  │  Lookup  │→ │   Network    │→ │   Bridge to Arc     │  │
│  └──────────┘  └──────────────┘  └─────────────────────┘  │
│       ↓               ↓                      ↓             │
│  Resolve .eth    Instant TX          Cross-chain USDC     │
│  + preferences   (gasless)           settlement           │
└─────────────────────────────────────────────────────────────┘
```

### Payment Modes

#### Fast Mode (Yellow Network → CCTP → Arc)
**Best for:** Quick payments, recurring transactions, micropayments
1. Recipient has fast mode enabled in ENS
2. Yellow Network instant transfer (0 gas fees)
3. CCTP bridges to Arc for settlement
4. Result: Instant + gasless + cross-chain ✨

#### On-Chain Mode (Direct CCTP)
**Best for:** Large amounts, maximum security
1. Direct CCTP bridge from Sepolia to Arc
2. On-chain confirmation
3. Result: Maximum security with Circle's attestation

---

## Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Web3:** Viem, Wagmi, RainbowKit
- **Database:** PostgreSQL (NeonDB) with Prisma ORM
- **Protocols:**
  - ENS (viem built-in)
  - Yellow Network (`@erc7824/nitrolite`)
  - Circle CCTP (official contracts)
  - Arc Network (Testnet)

---

## Project Structure
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── settle/        # CCTP relayer endpoint
│   │   │   └── transactions/  # Transaction CRUD
│   │   ├── history/           # Transaction history page
│   │   ├── profile/           # ENS profile settings
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── ens/              # ENS input and resolution
│   │   ├── payments/         # Payment form and flow
│   │   ├── profile/          # Profile settings
│   │   └── ui/               # Reusable UI components
│   ├── hooks/
│   │   ├── useYellowNetwork.ts   # Yellow Network integration
│   │   ├── useCCTPBridge.ts      # CCTP bridge logic
│   │   ├── useArcBalance.ts      # Arc balance queries
│   │   └── useTxStore.ts         # Transaction state management
│   ├── services/
│   │   ├── ens/                  # ENS resolution and writing
│   │   ├── yellow.ts             # Yellow Network client
│   │   └── cctp.ts               # CCTP bridge implementation
│   ├── config/
│   │   ├── chains.ts             # Chain configurations
│   │   ├── ens.ts                # ENS text record keys
│   │   └── wallet.ts             # Wallet configuration
│   └── types/                    # TypeScript types
├── prisma/
│   └── schema.prisma             # Database schema
└── public/                       # Static assets
```

---

## Key Features

✅ **ENS-based payments** - Send to vitalik.eth, not 0x123...  
✅ **Recipient preferences** - Automatic routing to preferred chain/token  
✅ **Gasless transfers** - Yellow Network state channels = 0 fees  
✅ **Cross-chain settlement** - CCTP bridges USDC to any chain  
✅ **Arc Network integration** - USDC-native chain for lowest costs  
✅ **Transaction history** - PostgreSQL database tracks all payments  
✅ **Real-time status** - See payment progress through every step  
---

## Testing

### Get Testnet Tokens

1. **Sepolia ETH**: [Alchemy Faucet](https://sepoliafaucet.com/)
2. **Sepolia USDC**: [Circle Faucet](https://faucet.circle.com/)
3. **ENS Names**: [ENS Sepolia App](https://sepolia.app.ens.domains/)

### Test Payment Flow

1. Set up your ENS profile at `/profile`
2. Select Arc as preferred chain
3. Enable fast mode for Yellow Network
4. Have a friend send you payment to your .eth name
5. Check transaction history at `/history`

---

## Acknowledgments

Built with:
- [ENS](https://ens.domains/) - Ethereum Name Service
- [Yellow Network](https://yellow.com/) - State channel infrastructure
- [Circle CCTP](https://www.circle.com/en/cross-chain-transfer-protocol) - Cross-chain USDC bridge
- [Arc Network](https://arc.network/) - USDC-native blockchain

---

**Made with ❤️ for HackMoney 2026**
