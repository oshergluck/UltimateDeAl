
🛍️ UltimateDeAl
UltimateDeAl is a fully decentralized e-commerce and fundraising platform built on smart contracts. It allows any startup or individual to:

Launch a personal store (sale or rental)

Sell or rent products & services

Issue NFT-based invoices and access keys

Raise funding via a built-in crowdfunding system

Distribute dividends through a decentralized governance token (ESH)

Built on Base network – gas fees are near zero, and users can onboard without paying gas directly via smart account infrastructure.

🚀 Features
🛍 ESHStore – Sell or rent products, minting NFT receipts for each transaction

🧾 NFT Invoice – Each purchase mints an NFT that can serve as a license, key, or proof-of-purchase

🪙 ESH Token – Your startup’s blockchain stock, with voting power and dividend distribution

📊 Crowdfunding – Raise capital by selling equity tokens (ESH) directly to backers

🗳 Governance – Let token holders vote on company decisions

📧 Auto Notifications – Email receipts sent to buyers and sellers

🧠 Smart Contracts
Contract	Description	Live
ESH	Governance & Dividend Token	[View](https://thirdweb.com/ultimatedeal.eth/ESHVoting)
ESHStoreSales	Sales Marketplace	[View](https://thirdweb.com/ultimatedeal.eth/ESHStoreSales)
ESHStoreRentals	Rental Marketplace	[View](https://thirdweb.com/ultimatedeal.eth/ESHStoreRentals)
ESHInvoicesMinter	NFT Receipt Generator	[View](https://thirdweb.com/ultimatedeal.eth/ESHInvoicesMinter)
ESHVoting	Voting & Governance	[View](https://thirdweb.com/ultimatedeal.eth/ESH)

🛠 Tech Stack
Frontend: React + Vite

Blockchain: Solidity + Thirdweb SDK

Web3 Wallets: Metamask, Smart Accounts (ERC-4337)

Email API: AutoMail via server hooks (planned integration)

📦 Installation
bash
Copy
Edit
git clone https://github.com/oshergluck/UltimateDeAl
cd UltimateDeAl
npm install
npm run dev
🌐 Live Demo
You can test and explore the deployed dApp at:
👉 https://ultrashop.tech/shop/mainshop

📚 How It Works
Start a Store – Deploy a subdomain with a store contract (rent or sale)

NFT Issuance – Each product is tied to an NFT with expiration/support features

Crowdfund – Launch a funding campaign and distribute ESH tokens

Distribute Profits – Use the smart dividend system to send USDC to holders

Vote – Let your token holders decide on roadmap, changes, or payouts

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

For a deep dive into the Solidity Architecture and the Bonding Curve logic, check out the core protocol repository: https://github.com/oshergluck/ESH-Protocol-SmartContracts

## Backend & Infrastructure
This protocol is supported by a hybrid off-chain architecture for privacy and notifications:
* **[Encryption Server](https://github.com/oshergluck/ESH-BACKEND-ENC-SERVER):** Secure key management and PII encryption/decryption service.
* **[Event Indexer & Notification Service](https://github.com/oshergluck/ESH-Emails-Server):** Node.js worker that listens to on-chain events and handles email notifications.
