# CharityChain — System Architecture

## Overview

CharityChain is a blockchain-based transparent charity donation platform that combines:
- A traditional web application (React + Node.js + MongoDB)
- An Ethereum smart contract (Solidity + Hardhat) for donation transparency

---

## Architecture Diagram

```
DONOR / CHARITY / ADMIN (Browser)
         ↓
┌────────────────────────────────────┐
│   React + Vite Frontend            │
│   - React Router (page routing)    │
│   - Axios (API calls)              │
│   - Ethers.js (blockchain calls)   │
│   - MetaMask (wallet)              │
└────────┬──────────────────┬────────┘
         │ REST API          │ Ethereum JSON-RPC
         ↓                   ↓
┌────────────────┐  ┌─────────────────────┐
│  Express.js    │  │  MetaMask Wallet     │
│  Backend API   │  │  (in browser)        │
│                │  │        ↓             │
│  - JWT Auth    │  │  Ethers.js library   │
│  - Bcrypt      │  │        ↓             │
│  - Rate limit  │  │  CharityDonation.sol │
│        ↓       │  │  Smart Contract      │
│    MongoDB     │  │        ↓             │
│  (off-chain)   │  │  Hardhat Local Node  │
└────────────────┘  │  (or Sepolia)        │
                    └─────────────────────┘
```

---

## On-Chain vs Off-Chain Decision

### On the Blockchain (Ethereum)
| Data | Reason |
|------|--------|
| Donor wallet address | Provides transparent record of who donated |
| Charity wallet address | Verifiable recipient identity |
| Donation amount (wei) | Verifiable transaction amount |
| Block timestamp | Tamper-resistant time record |
| Transaction hash | Unique proof of transaction |
| Smart contract events | Public audit log |
| Charity verification status | Authoritative verification record |

### In MongoDB (Database)
| Data | Reason |
|------|--------|
| User profiles & passwords | Personal info should not be public; passwords never on blockchain |
| Charity name, description, contact | Can be large; not worth blockchain storage cost |
| Verification documents metadata | Actual documents should be stored securely off-chain |
| Application metadata | Business logic data, not needed on-chain |
| Admin notes | Internal information, not for public ledger |

---

## User Roles

| Role | Access |
|------|--------|
| Donor | Browse charities, donate, view own history |
| Charity | Submit application, view dashboard after verification |
| Admin | Verify/reject charities, view all donations, see statistics |

---

## Security Architecture

1. **Passwords**: Hashed with bcrypt (12 rounds) before storage.
2. **Authentication**: JWT tokens, 7-day expiry.
3. **Authorization**: Role-based middleware on all protected routes.
4. **Smart contract**: ReentrancyGuard, Ownable access control.
5. **Rate limiting**: 100 requests per 15 minutes per IP.
6. **Input validation**: express-validator on all API inputs.
7. **CORS**: Only configured origins allowed.
8. **No private keys in frontend**: MetaMask handles all signing.
