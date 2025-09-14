
# TrumPOW Web Wallet – Backend (Nest.js)
  
Backend service for the **TrumPOW Web Wallet**, built with **Nest.js** and **Prisma (MySQL 5.7)**.

This project exists because of my passion for the **TrumPOW community**. The goal is to provide reliable, open tooling that makes TrumPOW easier to build on and safer to use. This backend focuses on **block data caching**, **price fetching**, and **RPC relay (proxy) services** to keep the web/extension wallet fast, scalable, and developer-friendly.

![trmp wallet](https://r2.hysanalde.com/trmp-image.png)

## What this service does

- **RPC Relay / Proxy**  
  Centralizes wallet RPC traffic to protect nodes from overload, add retries/rate-limit, and enable load balancing.
- **Block/UTXO Data Caching**  
  Caches frequently used chain data (e.g., fee rates, UTXOs, tx lookups) to reduce node pressure and speed up responses.
- **Price Fetching**  
  Pulls market prices (e.g., TrumPOW vs. BTC/USDT) and exposes them via simple endpoints for the UI.

> **Note:** This service never handles mnemonics or private keys. Signing happens in the frontend only.


## TrumPOWD Node Configuration

This backend requires access to a **TrumPOW full node** (`TrumPOWd`) via RPC.  
By default, the service expects a locally running node on port **8342**.

### 1) Configure RPC credentials

Edit the file:

```

.env

````

and update the following fields to match your local node setup:

```ts
RPC_HOST = '' 
RPC_PORT = ''
RPC_USER = ''
RPC_PASSWORD = ''
````

### 2) Configure your `trumpowd.conf`

Make sure your TrumPOW node has RPC enabled. Example config (`~/.trumpowd/trumpowd.conf`):

```
rpcuser=TrumPOWd
rpcpassword=XXX233
rpcport=8342
rpcallowip=127.0.0.1
server=1
daemon=1
listen=1
txindex=1
```

⚠️ **Important:**
`txindex=1` **must be enabled** so the backend can retrieve transactions by `txid` from the full node. Without it, only mempool transactions will be available.

### 3) Restart TrumPOWd

After updating `trumpowd.conf`, restart your node:

```bash
trumpowd -daemon
```

Verify the node is running:

```bash
trumpow-cli  getblockchaininfo
```


---

## Tech Stack

- **Nest.js** – modular, testable Node.js framework
- **Prisma ORM** – type-safe DB access (MySQL 5.7)
- **Node.js** – recommended LTS
- **Caching** – in-memory or external cache (optional, depending on your deployment)

---

## Installation & Setup

### 1) Install Node.js (LTS)

**Linux/macOS (via nvm):**
```bash
# Install nvm
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart shell, then:
nvm install --lts
node -v
````

**Windows:**
Use the official Node.js LTS installer from nodejs.org or install **nvm-windows**.

### 2) Enable Yarn (recommended)

If your Node version includes Corepack:

```bash
corepack enable
corepack prepare yarn@stable --activate
yarn -v
```

Or install globally:

```bash
npm i -g yarn
```

### 3) Clone the repository

```bash
git clone https://github.com/Forlingham/trumPOW_web_wallet_server_nest.js.git
cd trumPOW_web_wallet_server_nest.js
```

### 4) Configure environment variables

EDIT  `.env` 

```env
# MySQL 5.7 connection
DATABASE_URL="mysql://root:root@localhost:3306/TrumPOW_web_wallet"

```

> Ensure your MySQL user has permissions to create tables and run migrations.

### 5) Install dependencies

```bash
yarn install
```

### 6) Apply Prisma schema (use migration **deploy**)

> For consumers of this repo, **do not** use `migrate dev`. Apply the committed migrations:

```bash
# Generate Prisma client
npx prisma generate

# Apply existing migrations to your database
npx prisma migrate deploy

# (Optional) Inspect DB
npx prisma studio
```

### 7) Run the service

**Development:**

```bash
npm run dev
```

The server starts on **[http://localhost:7050](http://localhost:7050)** by default.

**Production (example):**

```bash
npm run build
npm run start
```

---

## Security Model

* **No private keys in backend** – The server never receives mnemonics or private keys.
* **Frontend-only signing** – Transactions are built and signed in the UI, then sent here only for broadcasting or enrichment.
* **RPC isolation** – This service shields your nodes with caching/rate limiting (implementation-dependent) and centralizes network access.

---

## Development Scripts

Common scripts (your `package.json` may already include these):

```bash
# Development
npm run dev

# Build & run
npm run build
npm run start

# Prisma helpers
npx prisma generate
npx prisma migrate deploy
npx prisma studio
```

---

## Support the Author

If this project helps you or your community, consider supporting continued development:

**BTC**
`bc1qnvdrxs23t6ejuxjs6mswx7cez2rn80wrwjd0u8`

**BNB**
`0xD4dB57B007Ad386C2fC4d7DD146f5977c039Fefc`

**USDT (BEP-20)**
`0xD4dB57B007Ad386C2fC4d7DD146f5977c039Fefc`

**TrumPOW**
`TH1ffTyfj8EroCJ7FS2Re8tCM9rvcnYKw1`

Stars, issues, and PRs are also very welcome. Thank you for supporting the TrumPOW ecosystem! 🙏


## 📢 Links

- 🌐 Wallet Website (Web version): [https://trmpwallet.hysanalde.com/](https://trmpwallet.hysanalde.com/)  
- 📦 GitHub (Web Wallet): [https://github.com/Forlingham/trumPOW_web_wallet_server_nest.js](https://github.com/Forlingham/trumPOW_web_wallet_server_nest.js)  
- 🐦 Twitter: [https://x.com/Hysanalde](https://x.com/Hysanalde)
