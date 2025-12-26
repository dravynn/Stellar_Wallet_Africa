import * as StellarSdk from '@stellar/stellar-sdk';
import { getNetworkConfig } from './network';

export function getServer(): StellarSdk.Horizon.Server {
  const config = getNetworkConfig();
  return new StellarSdk.Horizon.Server(config.horizonUrl);
}

export function getNetworkPassphrase(): string {
  return getNetworkConfig().networkPassphrase;
}

export async function getBalance(publicKey: string): Promise<string> {
  try {
    const server = getServer();
    const account = await server.loadAccount(publicKey);
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

export async function getAllBalances(publicKey: string): Promise<any[]> {
  try {
    const server = getServer();
    const account = await server.loadAccount(publicKey);
    return account.balances;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  asset: string;
  date: string;
  hash: string;
  from: string;
  to: string;
}

export async function getTransactions(publicKey: string, limit: number = 10): Promise<Transaction[]> {
  try {
    const server = getServer();
    const transactions = await server.transactions().forAccount(publicKey).limit(limit).call();
    
    return transactions.records.map((tx: any) => {
      const operations = tx.operations || [];
      const paymentOp = operations.find((op: any) => op.type === 'payment');
      
      let type = 'Other';
      let amount = '0';
      let asset = 'XLM';
      let from = '';
      let to = '';
      
      if (paymentOp) {
        type = paymentOp.from === publicKey ? 'Sent' : 'Received';
        amount = paymentOp.amount || '0';
        asset = paymentOp.asset_type === 'native' ? 'XLM' : `${paymentOp.asset_code}:${paymentOp.asset_issuer}`;
        from = paymentOp.from || '';
        to = paymentOp.to || '';
      }
      
      return {
        id: tx.id,
        type,
        amount,
        asset,
        date: new Date(tx.created_at).toLocaleDateString(),
        hash: tx.hash,
        from,
        to,
      };
    });
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function fundAccount(publicKey: string): Promise<void> {
  const config = getNetworkConfig();
  if (!config.friendbotUrl) {
    throw new Error('Friendbot is only available on testnet');
  }
  const response = await fetch(`${config.friendbotUrl}?addr=${publicKey}`);
  if (!response.ok) {
    throw new Error('Failed to fund account from friendbot');
  }
}

export async function sendPayment(
  keypair: StellarSdk.Keypair,
  destination: string,
  amount: string,
  memo?: string
): Promise<string> {
  try {
    const server = getServer();
    const sourceAccount = await server.loadAccount(keypair.publicKey());
    
    const txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
      networkPassphrase: getNetworkPassphrase(),
      fee: StellarSdk.BASE_FEE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destination,
          asset: StellarSdk.Asset.native(),
          amount: amount,
        })
      )
      .setTimeout(300);

    // Add memo if provided
    if (memo && memo.trim()) {
      txBuilder.addMemo(StellarSdk.Memo.text(memo.trim()));
    }

    const transaction = txBuilder.build();

    transaction.sign(keypair);

    const result = await server.submitTransaction(transaction);
    return result.hash;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send payment');
  }
}

export async function addTrustline(
  keypair: StellarSdk.Keypair,
  assetCode: string,
  assetIssuer: string,
  limit?: string
): Promise<string> {
  try {
    const server = getServer();
    const sourceAccount = await server.loadAccount(keypair.publicKey());
    
    const asset = new StellarSdk.Asset(assetCode, assetIssuer);
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      networkPassphrase: getNetworkPassphrase(),
      fee: StellarSdk.BASE_FEE,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset: asset,
          limit: limit || '922337203685.4775807', // Max limit
        })
      )
      .setTimeout(300)
      .build();

    transaction.sign(keypair);

    const result = await server.submitTransaction(transaction);
    return result.hash;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add trustline');
  }
}

export async function removeTrustline(
  keypair: StellarSdk.Keypair,
  assetCode: string,
  assetIssuer: string
): Promise<string> {
  try {
    const server = getServer();
    const sourceAccount = await server.loadAccount(keypair.publicKey());
    
    const asset = new StellarSdk.Asset(assetCode, assetIssuer);
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      networkPassphrase: getNetworkPassphrase(),
      fee: StellarSdk.BASE_FEE,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset: asset,
          limit: '0', // Setting limit to 0 removes the trustline
        })
      )
      .setTimeout(300)
      .build();

    transaction.sign(keypair);

    const result = await server.submitTransaction(transaction);
    return result.hash;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to remove trustline');
  }
}
