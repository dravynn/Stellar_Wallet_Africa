import * as StellarSdk from '@stellar/stellar-sdk';

export class StellarWallet {
  private keypair: StellarSdk.Keypair | null = null;
  private server: StellarSdk.Horizon.Server;

  constructor() {
    this.server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  }

  async initialize(): Promise<void> {
    // Generate a new keypair
    this.keypair = StellarSdk.Keypair.random();
    
    // Fund the account on testnet
    const publicKey = this.keypair.publicKey();
    try {
      const response = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
      if (!response.ok) {
        throw new Error('Failed to fund account');
      }
    } catch (error) {
      console.error('Friendbot funding failed:', error);
      // Continue anyway - account might already be funded
    }
  }

  getPublicKey(): string {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }
    return this.keypair.publicKey();
  }

  getSecretKey(): string {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }
    return this.keypair.secret();
  }

  async getBalance(): Promise<string> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }

    try {
      const account = await this.server.loadAccount(this.keypair.publicKey());
      const xlmBalance = account.balances.find(
        (balance: any) => balance.asset_type === 'native'
      );
      return xlmBalance ? parseFloat(xlmBalance.balance).toFixed(7) : '0.0000000';
    } catch (error: any) {
      if (error.response?.status === 404) {
        return '0.0000000';
      }
      throw error;
    }
  }

  async fundAccount(): Promise<void> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }

    const publicKey = this.keypair.publicKey();
    const response = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
    
    if (!response.ok) {
      throw new Error('Failed to fund account from friendbot');
    }
  }

  async sendPayment(destination: string, amount: string): Promise<void> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }

    try {
      const sourceAccount = await this.server.loadAccount(this.keypair.publicKey());
      
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        networkPassphrase: StellarSdk.Networks.TESTNET,
        fee: StellarSdk.BASE_FEE,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destination,
            asset: StellarSdk.Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(300)
        .build();

      transaction.sign(this.keypair);

      const result = await this.server.submitTransaction(transaction);
      return;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send payment');
    }
  }
}

