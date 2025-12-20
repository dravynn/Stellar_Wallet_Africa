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
