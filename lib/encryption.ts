/**
 * Encrypts data using PBKDF2 key derivation
 * Note: This is a simplified MVP implementation. For production, use AES-256-GCM with proper scrypt.
 */
export async function encryptData(data: string, password: string): Promise<string> {
  const salt = generateRandomBytes(16);
  const key = await deriveKey(password, salt);
  
  // Simple XOR encryption (for MVP - in production use AES)
  const dataBytes = new TextEncoder().encode(data);
  const keyBytes = new Uint8Array(key);
  const encrypted = new Uint8Array(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  // Combine salt + encrypted data
  const combined = new Uint8Array(salt.length + encrypted.length);
  combined.set(salt, 0);
  combined.set(encrypted, salt.length);
  
  // Convert to base64 (browser-compatible)
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts data using PBKDF2 key derivation
 */
export async function decryptData(encryptedData: string, password: string): Promise<string> {
  // Convert from base64 (browser-compatible)
  const binaryString = atob(encryptedData);
  const combined = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    combined[i] = binaryString.charCodeAt(i);
  }
  
  const salt = combined.slice(0, 16);
  const encrypted = combined.slice(16);
  
  const key = await deriveKey(password, salt);
  const keyBytes = new Uint8Array(key);
  
  // Decrypt using XOR
  const decrypted = new Uint8Array(encrypted.length);
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return new TextDecoder().decode(decrypted);
}

/**
 * Derives a key from password using PBKDF2 (Web Crypto API)
 * Note: Using PBKDF2 for browser compatibility. For production, consider scrypt-wasm.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const passwordBytes = new TextEncoder().encode(password);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const keyBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes = 256 bits
  );
  
  return new Uint8Array(keyBits);
}

/**
 * Generates random bytes using Web Crypto API
 */
function generateRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}
