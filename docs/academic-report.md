# CharityChain — Academic Project Report

---

## A. Abstract

CharityChain is a blockchain-based transparent charity donation platform developed as a Computer Engineering mini project. The system leverages Ethereum smart contracts to create publicly verifiable, tamper-resistant records of charitable donations. The platform implements a three-tier architecture comprising a React.js frontend, a Node.js/Express.js backend with MongoDB, and a Solidity smart contract deployed on an Ethereum-compatible test network. Administrative verification is used to approve charities, while blockchain technology ensures that every donation transaction is permanently and publicly recorded. The system addresses the lack of transparency in traditional charity donation mechanisms.

---

## B. Introduction

The rapid growth of online charitable giving has created a need for systems that donors can trust. Traditional charity platforms rely on centralized records, which can be modified or manipulated. Blockchain technology offers an alternative: a decentralized, immutable ledger that records transactions publicly. CharityChain combines the strengths of traditional web applications with blockchain transparency to build a donation platform where every transaction is verifiable by anyone.

---

## C. Problem Statement

Existing charity donation systems suffer from:
1. Lack of transparency — donors cannot verify how funds are used
2. Centralized records — can be modified by platform administrators
3. No publicly verifiable donation proof
4. No standard mechanism for charity verification
5. Donors have no way to track their donations independently

---

## D. Existing System

Current charity platforms (e.g., GiveIndia, Ketto, GoFundMe) operate as centralized web applications. Donors trust the platform to accurately record and display donation information. There is no independent, publicly accessible record that donors can verify without relying on the platform's own data.

---

## E. Limitations of Existing System

- Donation records are stored in private databases
- No cryptographic proof of transaction
- Charity verification varies in rigor
- Difficult to audit donation history independently
- Intermediaries may hold funds before transferring to charities

---

## F. Proposed System

CharityChain proposes a hybrid system:
- Donation transactions are processed through a Solidity smart contract on Ethereum
- Every donation generates a publicly verifiable transaction hash
- Smart contract enforces that only verified charities receive donations
- Administrative review mechanism for charity verification
- MongoDB stores application data (profiles, descriptions)
- Blockchain stores transaction records (donor, charity, amount, timestamp)

---

## G. Objectives

1. Develop a Solidity smart contract for on-chain donation processing
2. Implement a charity verification mechanism with admin control
3. Build a React frontend with MetaMask wallet integration
4. Create a Node.js backend with JWT authentication and role-based access
5. Store donation records in MongoDB linked to blockchain transaction hashes
6. Provide a transparency page with public donation statistics
7. Implement three user roles: Donor, Charity, Admin

---

## H. Scope

- Ethereum testnet (Hardhat local / Sepolia)
- Web application (desktop and mobile responsive)
- Three user types: Donor, Charity, Admin
- Donation in test ETH only (no real funds)
- Academic demonstration purposes

---

## I. Methodology

The project follows an iterative development approach:
1. Smart contract design and testing (Solidity + Hardhat)
2. Backend API development (Node.js + Express + MongoDB)
3. Frontend development (React + Ethers.js + MetaMask)
4. Integration testing of all three layers
5. UI/UX refinement

---

## J. System Architecture

```
[Browser]
    │
    ├── React Frontend (Vite)
    │       ├── Axios → REST API (Backend)
    │       └── Ethers.js → MetaMask → Smart Contract
    │
    ├── Backend (Node.js + Express)
    │       └── Mongoose → MongoDB
    │
    └── Smart Contract (Solidity)
            └── Hardhat Local Network
```

---

## K. Data Flow

**Donation Flow:**
1. Donor selects verified charity
2. Frontend calls `contract.donate(charityWallet, {value: amount})`
3. MetaMask prompts user confirmation
4. Smart contract validates charity status → transfers ETH
5. Transaction hash returned to frontend
6. Frontend calls backend API to record donation in MongoDB
7. Backend stores donation record linked to transaction hash

---

## L. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR1 | System shall allow donor registration and login |
| FR2 | System shall allow MetaMask wallet connection |
| FR3 | System shall display only verified charities for donation |
| FR4 | System shall process donations via smart contract |
| FR5 | System shall record transaction hash after donation |
| FR6 | Admin shall approve/reject charity applications |
| FR7 | Approved charities shall be verified on-chain |
| FR8 | Donor shall view donation history with tx hashes |
| FR9 | System shall display public transparency statistics |
| FR10 | Charity shall view received donations dashboard |

---

## M. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR1 | Passwords hashed with bcrypt (12 rounds) |
| NFR2 | JWT tokens expire in 7 days |
| NFR3 | Smart contract protected against reentrancy |
| NFR4 | API rate limited to 100 req/15 min |
| NFR5 | Frontend responsive for desktop and mobile |
| NFR6 | No private keys exposed in frontend |
| NFR7 | All sensitive data stored only in MongoDB, not blockchain |

---

## N. Hardware Requirements

- Processor: Intel Core i3 or above
- RAM: 4 GB minimum (8 GB recommended)
- Storage: 2 GB free space
- Network: Internet connection for MetaMask

---

## O. Software Requirements

- OS: Windows 10/11, macOS, or Linux
- Node.js v18+
- MongoDB v6+
- MetaMask browser extension
- Modern browser (Chrome/Firefox)
- VS Code (recommended)

---

## P. Database Design

**User Collection:**
- _id, name, email, passwordHash, role, walletAddress, charityId, isActive, timestamps

**Charity Collection:**
- _id, name, description, email, phone, address, category, website, walletAddress, verificationStatus, verificationMetadata, adminNote, totalDonations, totalDonors, registeredBy, timestamps

**DonationRecord Collection:**
- _id, transactionHash, blockNumber, donorWallet, charityWallet, amount, amountWei, blockTimestamp, charityId, donorId, status, network, chainId, timestamps

---

## Q. Blockchain Design

**Network:** Ethereum-compatible (Hardhat local, chainId: 31337)
**Contract:** CharityDonation.sol
**Key mappings:**
- `charities[address]` → Charity struct (status, totalReceived, etc.)
- `donations[]` → Donation array (donor, charity, amount, timestamp)
- `donorDonations[address]` → donation IDs for a donor
- `charityDonations[address]` → donation IDs for a charity

---

## R. Smart Contract Design

```solidity
contract CharityDonation is ReentrancyGuard, Ownable {
    enum CharityStatus { Pending, Verified, Rejected }
    
    // Admin functions
    function registerCharity(address, string) external onlyOwner
    function verifyCharity(address) external onlyOwner
    function rejectCharity(address) external onlyOwner
    
    // Donation function
    function donate(address payable) external payable nonReentrant
    
    // View functions
    function getCharity(address) external view returns (...)
    function isCharityVerified(address) external view returns (bool)
    function getDonation(uint256) external view returns (...)
    function getTotalDonations() external view returns (uint256)
}
```

---

## S. Security

| Threat | Mitigation |
|--------|-----------|
| Reentrancy attack | `nonReentrant` modifier from OpenZeppelin |
| Unauthorized charity verification | `onlyOwner` modifier |
| Donation to unverified charity | `require(status == Verified)` |
| Zero-value donation | `require(msg.value > 0)` |
| Password theft | bcrypt hashing, never stored plain text |
| Token hijacking | JWT with expiry, HTTPS in production |
| Brute force | Rate limiting (100 req/15 min) |
| XSS/Injection | Input validation (express-validator) |
| Private key exposure | MetaMask handles all signing — no key in code |

---

## T. Testing

**Smart Contract Tests (26 tests — all passing):**
- Charity registration (6 tests)
- Charity verification (5 tests)
- Charity rejection (3 tests)
- Donations (12 tests)

**Backend API Testing (Postman):**
1. POST /api/auth/register → 201 Created
2. POST /api/auth/login → 200 with JWT token
3. GET /api/charities → 200 list of verified charities
4. POST /api/charities (charity role) → 201 application created
5. PUT /api/admin/charities/:id/approve (admin) → 200 approved
6. POST /api/donations → 201 donation recorded

---

## U. Results

- Smart contract: 26/26 tests passing
- Frontend build: Successful (0 errors)
- Backend: Server starts, MongoDB connected
- Complete donation flow working end-to-end
- Admin verification flow working
- MetaMask integration functional

---

## V. Advantages

1. Every donation has a publicly verifiable blockchain proof
2. Funds go directly to charity wallet — no intermediary holds funds
3. Smart contract enforces verification rules automatically
4. Transparent statistics available to public
5. Transaction hash serves as donation receipt
6. Tamper-resistant donation records

---

## W. Limitations

1. Uses test network only — not production-ready
2. Admin verification is centralized
3. No real document upload
4. Local Hardhat has no public blockchain explorer
5. Charity wallet identity not cryptographically verified

---

## X. Future Scope

1. IPFS integration for decentralized document storage
2. DAO-based community voting for charity verification
3. Deployment on Polygon for lower gas fees
4. Multi-signature admin contracts
5. Real-time WebSocket notifications
6. Mobile application

---

## Y. Conclusion

CharityChain successfully demonstrates how blockchain technology can enhance transparency in charitable giving. The system records every donation on an immutable blockchain ledger, giving donors verifiable proof of their contributions. The hybrid architecture (blockchain + MongoDB + React) balances the strengths of decentralized transparency with the practical requirements of a modern web application. The project meets all stated objectives and serves as a functional academic demonstration of blockchain application development.
