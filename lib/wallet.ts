import * as StellarSdk from '@stellar/stellar-sdk';
import { encryptData, decryptData } from './encryption';

const STORAGE_KEY = 'stellar_wallet_encrypted';
const ADDRESS_KEY = 'stellar_wallet_address';

export interface WalletData {
  publicKey: string;
  encryptedSecret: string;
}

/**
 * Creates a new Stellar wallet and encrypts the secret key
 */
export async function createWallet(password: string): Promise<WalletData> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet operations must be performed in the browser');
  }
  
  const keypair = StellarSdk.Keypair.random();
  const secretKey = keypair.secret();
  const publicKey = keypair.publicKey();
  
  const encryptedSecret = await encryptData(secretKey, password);
  
  // Store encrypted data
  localStorage.setItem(STORAGE_KEY, encryptedSecret);
  localStorage.setItem(ADDRESS_KEY, publicKey);
  
  return { publicKey, encryptedSecret };
}

/**
 * Imports a wallet from secret key and encrypts it
 */
export async function importWallet(secretKey: string, password: string): Promise<WalletData> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet operations must be performed in the browser');
  }
  
  try {
    // Validate secret key by creating keypair
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    const publicKey = keypair.publicKey();
    
    const encryptedSecret = await encryptData(secretKey, password);
    
    // Store encrypted data
    localStorage.setItem(STORAGE_KEY, encryptedSecret);
    localStorage.setItem(ADDRESS_KEY, publicKey);
    
    return { publicKey, encryptedSecret };
  } catch (error) {
    throw new Error('Invalid secret key');
  }
}

/**
 * Unlocks wallet by decrypting secret key
 */
export async function unlockWallet(password: string): Promise<StellarSdk.Keypair> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet operations must be performed in the browser');
  }
  
  const encryptedSecret = localStorage.getItem(STORAGE_KEY);
  
  if (!encryptedSecret) {
    throw new Error('No wallet found. Please create or import a wallet.');
  }
  
  try {
    const secretKey = await decryptData(encryptedSecret, password);
    return StellarSdk.Keypair.fromSecret(secretKey);
  } catch (error) {
    throw new Error('Invalid password');
  }
}

/**
 * Checks if a wallet exists
 */
export function hasWallet(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

/**
 * Gets the stored wallet public key
 */
export function getStoredAddress(): string | null {
  return localStorage.getItem(ADDRESS_KEY);
}

/**
 * Clears wallet data (logout)
 */
export function clearWallet(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ADDRESS_KEY);
}
