import * as StellarSdk from '@stellar/stellar-sdk';

// Stellar testnet Horizon server
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

export function getServer(): StellarSdk.Horizon.Server {
  return new StellarSdk.Horizon.Server(HORIZON_URL);
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
  const response = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
  if (!response.ok) {
    throw new Error('Failed to fund account from friendbot');
  }
}

export async function sendPayment(
  keypair: StellarSdk.Keypair,
  destination: string,
  amount: string
): Promise<string> {
  try {
    const server = getServer();
    const sourceAccount = await server.loadAccount(keypair.publicKey());
    
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

    transaction.sign(keypair);

    const result = await server.submitTransaction(transaction);
    return result.hash;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send payment');
  }
}
