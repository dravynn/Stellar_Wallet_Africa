# FREEDOM - Non-Custodial Stellar Wallet

A modern, non-custodial Stellar wallet built with Next.js and TypeScript, featuring a beautiful Ghana-inspired UI. This is an MVP wallet for the Stellar testnet.

## ⚠️ Security Warnings

**IMPORTANT: This is an MVP wallet with significant security limitations:**

1. **Browser Storage Risk**: Mnemonics are encrypted and stored in `localStorage`. Browser storage can be accessed by:
   - Malicious browser extensions
   - XSS attacks
   - Physical access to the device
   - Malware on the system

2. **Testnet Only**: This wallet is configured for **Stellar testnet only**. Do not use mainnet funds.

3. **Encryption**: The MVP uses scrypt key derivation with XOR encryption. For production, use AES-256-GCM.

4. **No Key Recovery**: If you lose your password, your wallet cannot be recovered. Always backup your mnemonic phrase.

5. **Development Status**: This is an MVP. Do not use for production or with significant funds.

## Features

- 🎨 Beautiful UI with Ghana-inspired colors (red, yellow, green, and warm earth tones)
- 🔐 Create new wallet with keypair generation
- 📥 Import existing wallet from secret key
- 🔒 Password-protected encryption (PBKDF2 key derivation)
- 💰 View XLM balance on Stellar testnet
- 📤 Send XLM payments
- 📥 Receive XLM with shareable address
- 🔄 Fund account via friendbot
- 🔄 Non-custodial - your keys, your crypto

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
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Onboarding page
│   ├── create/             # Create new wallet
│   ├── import/              # Import existing wallet
│   ├── unlock/              # Unlock wallet
│   ├── home/                # Wallet home (balance)
│   ├── send/                # Send ETH
│   └── receive/             # Receive ETH
├── components/
│   └── SecurityWarning.tsx  # Security warnings component
├── lib/
│   ├── encryption.ts        # Scrypt encryption utilities
│   ├── wallet.ts            # Wallet creation/import/unlock
│   └── provider.ts          # Ethereum provider (Sepolia)
└── README.md
```

## Pages

- `/` - Onboarding (create or import wallet)
- `/create` - Create new wallet with password
- `/import` - Import wallet from secret key
- `/unlock` - Unlock wallet with password
- `/home` - View balance and wallet address
- `/send` - Send XLM payments
- `/receive` - Receive XLM (show address)

## How It Works

### Wallet Creation
1. User creates a password (minimum 8 characters)
2. System generates a random Stellar keypair
3. Secret key is encrypted using PBKDF2 key derivation
4. Encrypted data is stored in `localStorage`
5. Public key is also stored for quick access

### Wallet Import
1. User enters existing Stellar secret key
2. System validates the secret key
3. User sets a password
4. Secret key is encrypted and stored

### Unlocking
1. User enters password
2. System decrypts secret key from `localStorage`
3. Keypair is reconstructed from secret key
4. User can now send transactions

### Sending Payments
1. User enters recipient address (Stellar address starting with G) and amount
2. User confirms with password
3. Transaction is signed and submitted to Stellar testnet

## Security Notes

### Current Implementation (MVP)
- **Encryption**: PBKDF2 key derivation (100k iterations) + XOR encryption
- **Storage**: Browser `localStorage`
- **Network**: Stellar testnet only

### Production Recommendations
1. **Use AES-256-GCM** instead of XOR encryption
2. **Consider hardware wallets** for key storage
3. **Implement secure key management** (Keychain, Secure Enclave)
4. **Add transaction signing UI** with clear details
5. **Implement rate limiting** for password attempts
6. **Add 2FA** for sensitive operations
7. **Use secure random number generation** for mnemonics
8. **Implement session timeout**
9. **Add transaction history** with proper indexing
10. **Consider using Web3Auth** or similar for production

### Best Practices for Users
1. **Always backup your mnemonic** in a secure, offline location
2. **Use a strong, unique password**
3. **Never share your mnemonic or password**
4. **Be cautious of browser extensions** that might access storage
5. **Use on a secure, private device**
6. **Clear browser data** when done (if using shared device)
7. **Verify addresses** before sending transactions

## Network Configuration

The wallet is configured for **Stellar testnet**:
- Horizon: `https://horizon-testnet.stellar.org`
- Friendbot: `https://friendbot.stellar.org`
- Network Passphrase: Test SDF Network ; September 2015

To change networks, update `lib/provider.ts`.

## Development

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Color Scheme

The wallet uses a color palette inspired by Ghana and Africa:

- **Primary (Red)**: `#ef4444` - Ghana flag red
- **Secondary (Gold/Yellow)**: `#f59e0b` - Ghana flag gold
- **Accent (Green)**: `#22c55e` - Ghana flag green
- **Earth Tones**: Warm browns and beiges for a natural, grounded feel

## Dependencies

- **@stellar/stellar-sdk** (v14) - Stellar library for wallet operations
- **Next.js** (v14) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Limitations (MVP)

1. No transaction history (UI ready, not implemented)
2. No asset support (XLM only)
3. No multi-network support (Stellar testnet only)
4. Basic encryption (XOR, not AES)
5. Browser storage only (no secure storage)
6. No hardware wallet support
7. No transaction queuing
8. No address book/contacts

## License

MIT

## Disclaimer

This software is provided "as is" without warranty. Use at your own risk. The developers are not responsible for any loss of funds. Always test with small amounts first and never use for production without proper security audits.
