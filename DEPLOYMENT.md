# CharityChain — Public Deployment Checklist & Guide

> This guide covers deploying CharityChain to:
> - **Blockchain**: Ethereum Sepolia Testnet
> - **Database**: MongoDB Atlas
> - **Backend**: Render Web Service
> - **Frontend**: Render Static Site

---

## Deployment Checklist

```
PRE-DEPLOYMENT
[ ] GitHub repository created and code pushed
[ ] .env files confirmed NOT committed to Git
[ ] node_modules/ confirmed NOT committed to Git

MONGODB ATLAS
[ ] MongoDB Atlas account created (https://cloud.mongodb.com)
[ ] Free M0 cluster created
[ ] Database user created (username + strong password)
[ ] Network access: IP 0.0.0.0/0 added (allows Render)
[ ] Connection string copied (mongodb+srv://...)

SEPOLIA BLOCKCHAIN
[ ] MetaMask wallet ready (this will be the admin/deployer wallet)
[ ] Sepolia RPC URL obtained from Alchemy or Infura
[ ] Sepolia test ETH obtained from faucet
[ ] Smart contract compiled
[ ] Smart contract deployed to Sepolia
[ ] Deployed contract address recorded

RENDER BACKEND
[ ] Backend deployed as Web Service on Render
[ ] All backend environment variables set in Render dashboard
[ ] Health check passing: /api/health returns 200
[ ] Seed script run (node utils/seed.js)

RENDER FRONTEND
[ ] Frontend deployed as Static Site on Render
[ ] All frontend environment variables set in Render dashboard
[ ] Frontend loads without errors
[ ] API calls reach backend successfully

TESTING
[ ] MetaMask configured for Sepolia network
[ ] Donor registration tested
[ ] Donor login tested
[ ] Charity registration tested
[ ] Admin login tested
[ ] Admin charity approval tested (database + blockchain)
[ ] Donation tested on Sepolia
[ ] Transaction hash visible
[ ] Sepolia Etherscan link works
[ ] Donor dashboard shows donation history
[ ] Admin dashboard shows statistics
```

---

## Step-by-Step Guide

### Step 1 — Push to GitHub

```bash
cd D:\CharityChain
git init
git add .
git commit -m "Initial CharityChain commit"
git remote add origin https://github.com/YOUR_USERNAME/charitychain.git
git push -u origin main
```

Confirm `.env` is NOT in the commit:
```bash
git status   # should NOT show .env files
```

---

### Step 2 — Create MongoDB Atlas Database

1. Go to https://cloud.mongodb.com → Create free account
2. Create a free **M0 cluster** (any region)
3. **Database Access** → Add user → username + password → "Read and write to any database"
4. **Network Access** → Add IP → `0.0.0.0/0` (allow all — Render has dynamic IPs)
5. **Connect** → Drivers → Copy the connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/charitychain?retryWrites=true&w=majority
   ```
   Replace `USERNAME` and `PASSWORD` with your actual credentials.

---

### Step 3 — Get Sepolia RPC URL

**Option A — Alchemy (recommended):**
1. Go to https://alchemy.com → Create free account
2. Create app → Network: **Ethereum Sepolia**
3. Copy the HTTPS URL:
   ```
   https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   ```

**Option B — Infura:**
1. Go to https://infura.io → Create free account
2. Create project → Copy Sepolia HTTPS endpoint

---

### Step 4 — Configure Deployer Wallet & Get Sepolia ETH

1. Open MetaMask → Select an account to use as **deployer/admin**
2. Export its private key: MetaMask → Account → Export Private Key
   > ⚠️ Never share this. Never commit it to Git.
3. Get Sepolia test ETH (free faucets):
   - https://sepoliafaucet.com (requires Alchemy account)
   - https://faucet.sepolia.dev
   - https://www.alchemy.com/faucets/ethereum-sepolia

---

### Step 5 — Deploy Smart Contract to Sepolia

Edit `D:\CharityChain\.env` (the ROOT .env, not backend/.env):
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
DEPLOYER_PRIVATE_KEY=0xYOUR_METAMASK_PRIVATE_KEY
```

Run deployment:
```bash
cd D:\CharityChain\blockchain
npm run deploy:sepolia
```

Expected output:
```
✅ CharityDonation deployed to: 0xABCDEF...
Network  : sepolia
Chain ID : 11155111
```

**Copy the contract address** — you need it in steps 6 and 7.

The deploy script automatically updates:
- `frontend/src/contracts/CharityDonation.json` (ABI + address)
- `backend/config/contracts/CharityDonation.json` (ABI + address)
- `blockchain/deployments/sepolia.json`

Verify on Etherscan: `https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS`

---

### Step 6 — Deploy Backend to Render

1. Go to https://render.com → New → **Web Service**
2. Connect your GitHub repository
3. Settings:
   - **Name**: `charitychain-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables (click **Add Environment Variable** for each):

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random string (run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `JWT_EXPIRES_IN` | `7d` |
| `CONTRACT_ADDRESS` | Your Sepolia contract address from Step 5 |
| `ADMIN_EMAIL` | `admin@charitychain.com` |
| `ADMIN_PASSWORD` | A strong password of your choice |

5. Click **Create Web Service** — wait for deploy to complete
6. Test health check: `https://charitychain-backend.onrender.com/api/health`
   - Should return: `{"status":"ok","service":"CharityChain Backend",...}`

7. **Seed the database** — run this once from your local machine:
   ```bash
   cd D:\CharityChain\backend
   # Temporarily update MONGODB_URI in backend/.env to your Atlas URI
   node utils/seed.js
   # Restore MONGODB_URI back to localhost after seeding
   ```
   
   Or SSH into Render shell and run `node utils/seed.js` from there.

8. **Set `FRONTEND_URL`** after frontend is deployed (Step 7):

---

### Step 7 — Deploy Frontend to Render

1. Go to Render → New → **Static Site**
2. Connect the same GitHub repository
3. Settings:
   - **Name**: `charitychain-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://charitychain-backend.onrender.com/api` |
| `VITE_CONTRACT_ADDRESS` | Your Sepolia contract address from Step 5 |
| `VITE_NETWORK_CHAIN_ID` | `11155111` |
| `VITE_NETWORK_NAME` | `Sepolia Testnet` |

5. Click **Create Static Site** — wait for build

6. Copy your frontend URL (e.g. `https://charitychain-frontend.onrender.com`)

7. **Go back to backend service** → Environment → Add:
   - `FRONTEND_URL` = `https://charitychain-frontend.onrender.com`
   - Click **Save** — backend redeploys automatically

---

### Step 8 — Configure MetaMask for Sepolia

MetaMask already includes Sepolia by default. To enable it:
1. MetaMask → Settings → Advanced → **Show test networks** → ON
2. Select **Sepolia Test Network**
3. Verify your balance shows test ETH

---

### Step 9 — Test the Live Deployment

1. Open `https://charitychain-frontend.onrender.com`
2. Connect MetaMask (ensure Sepolia network selected)
3. Register as a donor
4. Login as admin (`admin@charitychain.com` / your admin password)
5. Go to Admin → Charities → approve a charity (connects MetaMask to sign on-chain)
6. Donate to a verified charity
7. Copy the transaction hash
8. Open: `https://sepolia.etherscan.io/tx/YOUR_TX_HASH` — confirm it's on Sepolia

---

## Render Service Settings Summary

### Backend (Web Service)
| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check | `/api/health` |

### Frontend (Static Site)
| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

---

## Local Development (unchanged)

These commands still work exactly as before:

```bash
# Terminal 1 — start local blockchain
cd D:\CharityChain\blockchain
npm run node

# Terminal 2 — deploy locally + start backend
cd D:\CharityChain\blockchain
npm run deploy:local

cd D:\CharityChain\backend
node utils/seed.js
npm run dev

# Terminal 3 — start frontend
cd D:\CharityChain\frontend
npm run dev
# → http://localhost:5173
```

---

## Important Notes

- ⚠️ **Sepolia testnet only** — no real ETH is used anywhere
- ⚠️ The deployer wallet address becomes the smart contract **owner/admin** on-chain
- ⚠️ Keep your `DEPLOYER_PRIVATE_KEY` secret — it controls the smart contract
- ⚠️ MongoDB Atlas free tier has 512MB storage — more than sufficient for a demo
- ⚠️ Render free tier spins down after inactivity — first request may be slow (cold start ~30s)
