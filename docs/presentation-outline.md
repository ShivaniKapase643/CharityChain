# CharityChain — Presentation Outline (12–15 Slides)

---

## Slide 1: Title Slide
**Title:** CharityChain — Blockchain-Based Transparent Charity Donation System
**Subtitle:** Computer Engineering Mini Project
**Content:** Your name, roll number, guide name, college name, academic year
**Diagram:** CharityChain logo / blockchain graphic
**Say:** "This project presents CharityChain, a blockchain-based charity donation system that improves transparency through publicly verifiable transaction records."

---

## Slide 2: Introduction
**Title:** Introduction
**Bullets:**
- Online charity donations growing globally
- Donors need assurance that funds reach the right place
- Blockchain provides tamper-resistant, public transaction records
- CharityChain combines blockchain with traditional web technologies
**Diagram:** Charity donations statistics / growth chart
**Say:** "Charitable giving has grown, but donors often have no way to independently verify where their money goes. CharityChain solves this using blockchain."

---

## Slide 3: Problem Statement
**Title:** Problem Statement
**Bullets:**
- Traditional platforms use centralized databases (can be modified)
- No publicly verifiable donation proof
- Charity legitimacy varies — no standard verification
- Donors cannot independently audit transaction history
- Funds sometimes held by intermediaries
**Diagram:** Centralized vs. Decentralized comparison diagram
**Say:** "The core problem is that current charity platforms are black boxes. Donors must trust the platform completely. We propose a system where trust is not required — it can be verified."

---

## Slide 4: Existing System & Limitations
**Title:** Existing System
**Bullets:**
- Platforms like GiveIndia, GoFundMe, Ketto
- Store donation records in private databases
- No cryptographic proof of transfer
- Difficult independent audit
- Some intermediaries delay fund transfer
**Diagram:** Screenshot mockup of a centralized donation flow
**Say:** "Existing systems depend entirely on the platform's honesty. There is no way for a donor to independently verify their donation without trusting the platform."

---

## Slide 5: Proposed System
**Title:** Proposed System — CharityChain
**Bullets:**
- Donations processed via Solidity smart contract
- Every donation generates a blockchain transaction hash
- Smart contract enforces: only verified charities receive donations
- Admin reviews and approves charity applications
- MongoDB for off-chain data (profiles, descriptions)
- Blockchain for on-chain data (transactions, verification)
**Diagram:** High-level system flow diagram
**Say:** "CharityChain uses a hybrid approach. The blockchain records every transaction permanently. The database stores application data efficiently. The combination gives both transparency and performance."

---

## Slide 6: Objectives
**Title:** Project Objectives
**Bullets:**
1. Smart contract for on-chain donation processing
2. Charity verification by administrator
3. MetaMask wallet integration for donors
4. Three user roles: Donor, Charity, Admin
5. Transparent donation statistics
6. JWT-secured REST API
7. Responsive, professional UI
**Diagram:** Objective checklist / icons
**Say:** "These 7 objectives guided the entire development process. Each objective maps directly to a working feature in the final system."

---

## Slide 7: System Architecture
**Title:** System Architecture
**Bullets:**
- 3-tier: Frontend + Backend + Blockchain
- Frontend: React + Vite + Tailwind + Ethers.js
- Backend: Node.js + Express + MongoDB
- Blockchain: Solidity + Hardhat
- MetaMask bridges the frontend to the blockchain
**Diagram:** Architecture diagram (from docs/architecture.md)
**Say:** "The architecture has three layers. The frontend connects to both the backend for data and directly to the blockchain through MetaMask for transactions."

---

## Slide 8: Technology Stack
**Title:** Technology Stack
**Table format:**
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Blockchain | Ethers.js, MetaMask |
| Backend | Node.js, Express.js, JWT |
| Database | MongoDB, Mongoose |
| Smart Contract | Solidity 0.8.20, OpenZeppelin |
| Dev Tools | Hardhat, VS Code, Postman |
**Say:** "The stack was chosen to be modern, well-documented, and appropriate for an academic project. Each technology has a specific role."

---

## Slide 9: Blockchain & Smart Contract
**Title:** Smart Contract Design
**Bullets:**
- Contract: CharityDonation.sol
- Language: Solidity 0.8.20
- OpenZeppelin: ReentrancyGuard, Ownable
- Functions: registerCharity, verifyCharity, rejectCharity, donate
- Events: DonationReceived, CharityVerified, CharityRejected
- Security: reentrancy guard, zero-value check, owner-only admin
**Show:** Key code snippet from CharityDonation.sol
```solidity
function donate(address payable _charityWallet) 
    external payable nonReentrant {
    require(charities[_charityWallet].status == 
        CharityStatus.Verified, "Charity not verified");
    require(msg.value > 0, "Donation must be > zero");
    // ... transfers ETH, emits event
}
```
**Say:** "The smart contract is the core of the system. It ensures only verified charities can receive donations and every donation emits an event on the blockchain."

---

## Slide 10: User Modules
**Title:** System Modules
**Three columns:**
- **Donor:** Browse, Connect Wallet, Donate, View History
- **Charity:** Register, Dashboard, View Donations
- **Admin:** Verify Charities, View Stats, Manage Donations
**Diagram:** Three role cards with features listed
**Say:** "The system has three distinct user roles, each with their own protected dashboard and specific capabilities."

---

## Slide 11: Donation Flow
**Title:** Complete Donation Flow
**Numbered flow:**
1. Open verified charity → 2. Connect MetaMask
3. Enter amount → 4. MetaMask opens
5. Smart contract executes → 6. ETH transferred
7. Transaction hash received → 8. Backend records
9. Success screen with tx hash shown
**Diagram:** Flowchart of the donation process
**Show:** Screenshot of donation modal
**Say:** "This is the core user journey. A donation completes in under 30 seconds. The transaction hash is the proof — it can be verified by anyone on the blockchain."

---

## Slide 12: Screenshots (Live Demo)
**Title:** Live Demonstration
**Show:** (Screenshots of actual running application)
- Home page hero section
- Charity listing with verified badges
- Donation modal with MetaMask
- Transaction hash success screen
- Admin dashboard with charts
- Admin charity approval modal
**Say:** "Let me show you the live running system." (Proceed to live demo)

---

## Slide 13: Testing & Results
**Title:** Testing & Results
**Bullets:**
- Smart Contract Tests: **26/26 passing**
- Frontend Build: **Successful (0 errors)**
- Backend: **Server starts, MongoDB connected**
- Complete donation flow: **Working end-to-end**
- Admin verification: **Working with blockchain recording**
**Diagram:** Test results screenshot from Hardhat
**Say:** "All 26 smart contract test cases pass. These cover charity registration, verification, rejection, donation validation, and security checks."

---

## Slide 14: Advantages & Limitations
**Title:** Advantages & Limitations
**Advantages:**
- Every donation has a blockchain-verified proof
- Funds go directly to charity — no intermediary
- Smart contract enforces rules automatically
- Transparent statistics publicly visible
- Tamper-resistant transaction records

**Limitations:**
- Test network only
- Admin verification is centralized
- No real document upload
- No public explorer for local network

**Say:** "The key advantage is the transaction hash — an independent, verifiable proof of donation. The main limitation is that this is a testnet demonstration."

---

## Slide 15: Future Scope & Conclusion
**Title:** Future Scope & Conclusion
**Future Scope:**
- IPFS for decentralized document storage
- DAO-based community charity verification
- Polygon deployment for lower gas costs
- Mobile app

**Conclusion:**
- Successfully demonstrates blockchain transparency in charity donations
- Hybrid architecture balances transparency with practicality
- Meets all 7 stated objectives
- Functional academic demonstration

**Say:** "CharityChain demonstrates that blockchain can meaningfully improve donation transparency. While this is an academic project on testnet, the architecture is extensible to real-world deployment."

---

*Total: 15 slides | Estimated presentation time: 8-10 minutes*
