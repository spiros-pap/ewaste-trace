# e-Waste Traceability

End-to-end blockchain-based traceability for electronic waste items.  
Tracks the full lifecycle from **User disposal** → **Green Point collection** → **Carrier logistics** → **Recycler processing**.  
Provides an **Inspector** role for transparency and audit.

---

## Table of Contents
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup & Running Locally](#setup--running-locally)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Future Extensions](#future-extensions)
- [License](#license)

---

## Architecture

### On-chain (Hardhat + Solidity)
- **Contract:** `contracts/EwasteRegistry.sol`
- **Roles (AccessControl):**
  - `ADMIN_ROLE` — registers users and assigns roles.
  - `USER_ROLE` — registers devices.
  - `GREEN_POINT_ROLE` — confirms collection.
  - `CARRIER_ROLE` — records transfers/deliveries.
  - `RECYCLER_ROLE` — processes devices.
- **Lifecycle functions:**
  - `registerDevice(uid, category, hazard, state)`
  - `confirmCollection(uid, site)`
  - `recordTransfer(uid, fromSite, toSite, notes)`
  - `deliverToRecycler(uid, recyclerSite)`
  - `processDevice(uid, kind)` (Recycle / Destroy)
  - `getDevice(uid)`, `getHistory(uid)`

### Front-end (Vite + React + TypeScript)
- **Role-gated panels** for Admin, User, Green Point, Carrier, Recycler.
- **Inspector tab** public search by UID.
- Connects to Hardhat local blockchain via `wagmi` + `viem`.
- Styling: TailwindCSS.

---

## Tech Stack

**Smart Contracts**
- Solidity
- Hardhat
- OpenZeppelin Contracts

**Front-end**
- Vite + React + TypeScript
- wagmi, viem
- TailwindCSS
- sonner (toast notifications)

**Dev Tools**
- MetaMask (Hardhat Localhost network)
- Node.js & npm

---

## Setup & Running Locally

### 1) Install dependencies
From project root
`npm install`

### 2) Start local blockchain
`npx hardhat node`

(Keep this terminal open as it outputs funded test accounts and private keys.)

### 3) Deploy the contract
In a new terminal:
`npx hardhat run scripts/deploy.ts --network localhost`

Copy the deployed contract address.

### 4) Seed roles & demo data 
`npx hardhat run scripts/seed.ts --network localhost --addr <DEPLOYED_CONTRACT_ADDRESS>`

This assigns:

Account #0 → Admin
Account #1 → User
Account #2 → Green Point
Account #3 → Carrier
Account #4 → Recycler

And inserts sample devices and full transfer history.

### 5) Set up the front-end
`cd app`
`npm install`

Create .env in app/

`VITE_CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>`
`VITE_RPC_URL=http://127.0.0.1:8545`

### 6) Run the UI
`npm run dev`

Visit http://localhost:5173

### 7) MetaMask setup
Add Hardhat Localhost network:
  RPC: http://127.0.0.1:8545
  Chain ID: 31337

Import Accounts #0–#4 from Hardhat node output (use private keys).

### Project Structure
ewaste-trace/

├── contracts/ (Solidity smart contracts)

├── scripts/ (Deploy & seed scripts)

├── test/  (Contract tests (if added))

├── artifacts/  (Hardhat build output (ignored in git))

├── cache/  (Hardhat cache (ignored in git))

├── app/  (Front-end (Vite + React + TS))

│ ├── src/

│ │ ├── components/  (Role panels, Connect button, shared UI)

│ │ ├── hooks/ ( useRoles.ts, custom hooks)

│ │ ├── abi/  (EwasteRegistry ABI)

│ │ ├── wagmi.ts  (wagmi/viem config)

│ │ ├── Inspector.tsx  (Inspector view)

│ │ ├── App.tsx  (Main tab navigation)

│ │ └── index.css  (Tailwind entrypoint)

│ ├── public/  (Static assets)

│ └── .env  (UI environment variables)

├── hardhat.config.ts

├── tailwind.config.js

├── postcss.config.js

└── README.md
### Usage Guide

1.Inspector:
  Search for UID (e.g., DEV-1000)
  View device details and full transfer history.

2.Admin:
  Assign roles to Ethereum addresses.

3.User:
  Register a new device with category, hazard, and state.

4.Green Point:
  Confirm collection from a user.

5.Carrier:
  Record transfer hops and deliver to recycler.

6.Recycler:
  Mark device as processed (Recycle / Destroy).

### Future Extensions

Security & Governance
  Multi-sig admin; pausable emergency stop.

Data Integration
  IPFS/Arweave file storage (e.g., disposal certificates).
  CSV/PDF export for audit.

IoT/Oracles
  GPS-verified carrier hops.
  Automated SLA checks on delivery times.

Tokenization
  NFT per device (ERC-721) with full provenance.
  Incentive schemes for recycling.

Deployment
  Testnet (Sepolia) & Etherscan verification.
  CI/CD with tests & build.

### License
MIT
