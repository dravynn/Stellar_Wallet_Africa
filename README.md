# Stellar Wallet - Ghana

A modern, clean Stellar wallet application built with Next.js and TypeScript, featuring an African-inspired color scheme.

## Features

- 🎨 Beautiful UI with Ghana-inspired colors (red, yellow, green, and warm earth tones)
- 💰 View your Stellar balance
- 📤 Send XLM payments
- 📥 Receive payments with shareable address
- 🔄 Fund account on testnet
- 📱 Responsive design
- ⚡ Built with Next.js 14 and TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn (or npm)

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Run the development server:
```bash
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main wallet page
│   └── globals.css      # Global styles
├── components/
│   ├── WalletHeader.tsx    # Header component
│   ├── BalanceCard.tsx      # Balance display
│   ├── TransactionList.tsx # Transaction history
│   ├── SendModal.tsx        # Send payment modal
│   └── ReceiveModal.tsx     # Receive payment modal
├── lib/
│   └── stellar-wallet.ts   # Stellar SDK integration
└── generate-keypair.js     # Keypair generation script
```

## Color Scheme

The wallet uses a color palette inspired by Ghana and Africa:

- **Primary (Red)**: `#ef4444` - Ghana flag red
- **Secondary (Gold/Yellow)**: `#f59e0b` - Ghana flag gold
- **Accent (Green)**: `#22c55e` - Ghana flag green
- **Earth Tones**: Warm browns and beiges for a natural, grounded feel

## Stellar Network

This wallet is configured for the **Stellar Testnet**. To use on mainnet, update the Horizon server URL in `lib/stellar-wallet.ts`.

## Development

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## License

MIT

