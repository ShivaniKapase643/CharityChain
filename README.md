# ⛓️ CharityChain
### Blockchain-Based Transparent Charity Donation System
> Academic Mini Project | Computer Engineering

---

## What It Is

CharityChain records every donation on an Ethereum blockchain smart contract, giving donors a publicly verifiable, tamper-resistant proof of their contribution. Charities are reviewed and approved by an administrator. The platform uses a hybrid architecture: blockchain for transaction transparency, MongoDB for application data.

> **Important:** Administrative verification identifies charities — blockchain alone does not prove a charity is legitimate. Blockchain provides transparent transaction records.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Blockchain | Ethers.js v6, MetaMask |
| Backend | Node.js, Express.js, JWT, bcrypt |
| Database | MongoDB, Mongoose |
| Smart Contract | Solidity 0.8.20, OpenZeppelin, Hardhat |

---

## Features

- Browse and search verified charities
- MetaMask wallet connection
- Donate via Solidity smart contract
- Transaction hash as blockchain proof
- Sepolia Etherscan link after donation
- Donor dashboard with full donation history
- Charity dashboard with received donations
- Admin panel: approve/reject charities (DB + on-chain)
- Transparency page with public statistics
- Wrong-network detection and auto-switch prompt

---

## User Roles & Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@charitychain.com | Admin@1234 |
| Donor | donor@charitychain.demo | Donor@1234 |
| Charity | info@greenearth.demo | Charity@1234 |

---

---

# LOCAL DEVELOPMENT

---

## Prerequisites

- Node.js v18+
- npm v9+
- MongoDB (local): https://mongodb.com/try/download/community
- MetaMask browser extension: https://metamask.io
- Git

---

## Setup — Local

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/charitychain.git
cd charitychain
```

### 2. Install dependencies

```bash
cd blockchain && npm install && cd ..
cd backend   && npm install && cd ..
cd frontend  && npm install && cd ..
```

### 3. Configure environment

**backend/.env** — already provided, no changes needed for local:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/charitychain
JWT_SECRET=charitychain_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@charitychain.com
ADMIN_PASSWORD=Admin@1234
NODE_ENV=development
```

**frontend/.env** — already provided:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_NETWORK_CHAIN_ID=31337
VITE_NETWORK_NAME=Hardhat Local
```

### 4. Run (3 terminals)

**Terminal 1 — Start local blockchain node:**
```bash
cd blockchain
npm run node
```
Keep this running. It prints 20 test accounts with private keys.

**Terminal 2 — Deploy contract + seed + start backend:**
```bash
# Deploy contract to local Hardhat
cd blockchain
npm run deploy:local
# → Copy the printed contract address

# Paste address into backend/.env → CONTRACT_ADDRESS=0x...
# Paste address into frontend/.env → VITE_CONTRACT_ADDRESS=0x...
# (The deploy script also auto-writes it to frontend/src/contracts/CharityDonation.json)

cd ../backend
node utils/seed.js    # creates admin + demo charities
npm run dev           # starts on http://localhost:5000
```

**Terminal 3 — Start frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

### 5. MetaMask — Local Setup

1. Open MetaMask → Add Network → Custom RPC:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`
2. Import a test account: copy a private key from Terminal 1 output
3. You'll have 10,000 test ETH — connect and donate

---

## Smart Contract Tests

```bash
cd blockchain
npm test
```

Expected: **26 tests passing**

---

---

# PUBLIC DEPLOYMENT (Sepolia + MongoDB Atlas + Render)

---

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full step-by-step guide and checklist.

### Quick overview:

| Step | What |
|------|------|
| 1 | Push code to GitHub |
| 2 | Create MongoDB Atlas cluster → get connection string |
| 3 | Get Sepolia RPC URL from Alchemy or Infura |
| 4 | Export MetaMask deployer private key + get Sepolia test ETH |
| 5 | `npm run deploy:sepolia` → copy contract address |
| 6 | Deploy backend to Render Web Service |
| 7 | Deploy frontend to Render Static Site |
| 8 | Set all env vars in Render dashboard |
| 9 | Configure MetaMask for Sepolia |
| 10 | Test full donation flow on Sepolia |

### Render Service Settings

**Backend (Web Service)**
```
Root Directory:  backend
Build Command:   npm install
Start Command:   npm start
Health Check:    /api/health
```

**Frontend (Static Site)**
```
Root Directory:  frontend
Build Command:   npm install && npm run build
Publish Dir:     dist
```

### Required Render Environment Variables

**Backend:**
| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random string (min 32 chars) |
| `JWT_EXPIRES_IN` | `7d` |
| `CONTRACT_ADDRESS` | Sepolia deployed contract address |
| `FRONTEND_URL` | `https://charitychain-frontend.onrender.com` |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |

**Frontend:**
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | `https://charitychain-backend.onrender.com/api` |
| `VITE_CONTRACT_ADDRESS` | Sepolia deployed contract address |
| `VITE_NETWORK_CHAIN_ID` | `11155111` |
| `VITE_NETWORK_NAME` | `Sepolia Testnet` |

---

## Project Structure

```
CharityChain/
├── blockchain/                  # Hardhat + Solidity
│   ├── contracts/
│   │   └── CharityDonation.sol  # Main smart contract
│   ├── scripts/deploy.js        # Deploy to local or Sepolia
│   ├── test/                    # 26 contract tests
│   └── hardhat.config.js
│
├── backend/                     # Node.js + Express API
│   ├── controllers/             # Route logic
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # API routes
│   ├── middleware/              # Auth + validation
│   ├── utils/seed.js            # Demo data seeder
│   └── server.js
│
├── frontend/                    # React + Vite
│   └── src/
│       ├── pages/               # All pages (public/donor/charity/admin)
│       ├── components/          # Reusable UI
│       ├── context/             # Auth, Wallet, Toast context
│       ├── services/            # api.js, blockchain.js
│       └── contracts/           # ABI (auto-written by deploy script)
│
├── docs/                        # Academic documentation
├── render.yaml                  # Render deployment config
├── DEPLOYMENT.md                # Step-by-step deployment guide
├── .env.example                 # Variable reference (no secrets)
└── README.md
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register donor/charity |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/charities | — | List verified charities |
| GET | /api/charities/:id | — | Charity details |
| POST | /api/charities | JWT+Charity | Submit application |
| GET | /api/charities/my/dashboard | JWT+Charity | Charity dashboard |
| GET | /api/admin/charities/pending | JWT+Admin | Pending applications |
| PUT | /api/admin/charities/:id/approve | JWT+Admin | Approve charity |
| PUT | /api/admin/charities/:id/reject | JWT+Admin | Reject charity |
| GET | /api/admin/donations | JWT+Admin | All donations |
| GET | /api/admin/statistics | JWT+Admin | Platform stats |
| POST | /api/donations | — | Record donation after tx |
| GET | /api/donations | JWT | My donations |
| GET | /api/donations/tx/:hash | — | Lookup by tx hash |
| GET | /api/health | — | Health check |

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens, 7-day expiry
- Role-based access on all protected routes
- Smart contract: ReentrancyGuard + Ownable
- Zero-value donations rejected on-chain
- Unverified charities cannot receive donations on-chain
- No private keys in frontend code
- CORS restricted to configured origins via `FRONTEND_URL`
- Rate limiting: 100 req/15 min per IP
- `VITE_*` variables are public — secrets never put there

---

## Limitations

- Sepolia testnet only — no real funds
- Admin verification is centralized
- No IPFS for document storage
- Render free tier has cold-start delays (~30s)

---

## Future Scope

- IPFS for decentralized document storage
- DAO-based charity verification
- Polygon deployment for lower gas
- Mobile app (React Native)

---

*Academic mini project. All sample charities are fictional demo data. Uses testnet only.*
