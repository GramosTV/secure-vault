// Utility functions for encryption key management

/**
 * Generates a random AES key and returns it as Base64
 * @param keySize - Key size in bits (128, 192, or 256)
 * @returns Base64-encoded AES key
 */
export const generateAESKey = (keySize: 128 | 192 | 256 = 256): string => {
  const keyBytes = keySize / 8; // Convert bits to bytes
  const key = new Uint8Array(keyBytes);

  // Generate random bytes using Web Crypto API if available, fallback to Math.random
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(key);
  } else {
    // Fallback for environments without Web Crypto API
    for (let i = 0; i < keyBytes; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }
  }

  return arrayBufferToBase64(key.buffer);
};

/**
 * Converts a text key to a properly formatted Base64 AES key
 * @param textKey - Plain text key
 * @param keySize - Desired key size in bits (128, 192, or 256)
 * @returns Base64-encoded AES key
 */
export const textToAESKey = (textKey: string, keySize: 128 | 192 | 256 = 256): string => {
  const keyBytes = keySize / 8;
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(textKey);

  // Create a key of the exact required length
  const key = new Uint8Array(keyBytes);

  if (textBytes.length >= keyBytes) {
    // If text is longer than needed, truncate
    key.set(textBytes.slice(0, keyBytes));
  } else {
    // If text is shorter, repeat it to fill the key
    let offset = 0;
    while (offset < keyBytes) {
      const remainingBytes = keyBytes - offset;
      const bytesToCopy = Math.min(textBytes.length, remainingBytes);
      key.set(textBytes.slice(0, bytesToCopy), offset);
      offset += bytesToCopy;
    }
  }

  return arrayBufferToBase64(key.buffer);
};

/**
 * Validates if a string is a valid Base64-encoded key
 * @param key - The key string to validate
 * @returns True if valid Base64, false otherwise
 */
export const isValidBase64Key = (key: string, algorithm?: 'AES' | 'DES' | 'CHACHA20'): boolean => {
  try {
    const decoded = base64ToArrayBuffer(key);

    if (algorithm === 'DES') {
      // DES key must be 8 bytes (64 bits)
      return decoded.byteLength === 8;
    } else if (algorithm === 'CHACHA20') {
      // ChaCha20 key must be 32 bytes (256 bits)
      return decoded.byteLength === 32;
    } else {
      // Default case for AES: check if it's a valid AES key length
      const validLengths = [16, 24, 32]; // 128, 192, 256 bits
      return validLengths.includes(decoded.byteLength);
    }
  } catch {
    return false;
  }
};

/**
 * Gets the key size in bits from a Base64-encoded key
 * @param base64Key - Base64-encoded key
 * @returns Key size in bits or null if invalid
 */
export const getKeySize = (base64Key: string): number | null => {
  try {
    const decoded = base64ToArrayBuffer(base64Key);
    return decoded.byteLength * 8;
  } catch {
    return null;
  }
};

/**
 * Generates a ChaCha20 key (32 bytes) as Base64
 * @returns Base64-encoded ChaCha20 key
 */
export const generateChaCha20Key = (): string => {
  const key = new Uint8Array(32); // ChaCha20 uses 32-byte keys

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(key);
  } else {
    // Fallback for environments without Web Crypto API
    for (let i = 0; i < 32; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }
  }

  return arrayBufferToBase64(key.buffer);
};

/**
 * Converts a text key to a properly formatted Base64 ChaCha20 key
 * @param textKey - Plain text key
 * @returns Base64-encoded ChaCha20 key
 */
export const textToChaCha20Key = (textKey: string): string => {
  const keyBytes = 32; // ChaCha20 requires 32 bytes
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(textKey);

  // Create a key of the exact required length
  const key = new Uint8Array(keyBytes);

  if (textBytes.length >= keyBytes) {
    // If text is longer than needed, truncate
    key.set(textBytes.slice(0, keyBytes));
  } else {
    // If text is shorter, repeat it to fill the key
    let offset = 0;
    while (offset < keyBytes) {
      const remainingBytes = keyBytes - offset;
      const bytesToCopy = Math.min(textBytes.length, remainingBytes);
      key.set(textBytes.slice(0, bytesToCopy), offset);
      offset += bytesToCopy;
    }
  }

  return arrayBufferToBase64(key.buffer);
};

/**
 * Generates a DES key (8 bytes) as Base64
 */
export const generateDESKey = (): string => {
  const key = new Uint8Array(8); // DES uses 8-byte keys

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(key);
  } else {
    for (let i = 0; i < 8; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }
  }

  return arrayBufferToBase64(key.buffer);
};

/**
 * Converts a text key to a properly formatted Base64 DES key
 * @param textKey - Plain text key
 * @returns Base64-encoded DES key
 */
export const textToDESKey = (textKey: string): string => {
  // Create a byte array from the text
  const textEncoder = new TextEncoder();
  const bytes = textEncoder.encode(textKey);

  // Create a new 8-byte array (DES key size)
  const desKeyBytes = new Uint8Array(8);

  if (bytes.length === 0) {
    // Handle empty string case
    for (let i = 0; i < 8; i++) {
      desKeyBytes[i] = 0;
    }
  } else if (bytes.length === 8) {
    // If it's exactly 8 bytes, use it directly
    desKeyBytes.set(bytes);
  } else if (bytes.length < 8) {
    // If less than 8 bytes, repeat the pattern
    let pos = 0;
    while (pos < 8) {
      const bytesToCopy = Math.min(bytes.length, 8 - pos);
      desKeyBytes.set(bytes.subarray(0, bytesToCopy), pos);
      pos += bytesToCopy;
    }
  } else {
    // If more than 8 bytes, use a simple folding technique for consistent results
    // This ensures the same input always produces the same key
    for (let i = 0; i < bytes.length; i++) {
      desKeyBytes[i % 8] ^= bytes[i]; // XOR the bytes to fold them into 8 bytes
    }
  }

  return arrayBufferToBase64(desKeyBytes.buffer);
};

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Key validation and suggestion messages
 */
export const getKeyValidationMessage = (algorithm: 'AES' | 'CHACHA20' | 'DES', key: string): string | null => {
  if (!key.trim()) {
    return 'Key is required';
  }

  switch (algorithm) {
    case 'AES':
      if (isValidBase64Key(key)) {
        const keySize = getKeySize(key);
        return `Valid AES-${keySize} key`;
      } else {
        return 'Invalid AES key. Please use a Base64-encoded key or generate one.';
      }

    case 'DES':
      try {
        const decoded = base64ToArrayBuffer(key);
        if (decoded.byteLength === 8) {
          return 'Valid DES key';
        } else {
          return 'DES key must be exactly 8 bytes (64 bits) when Base64 decoded';
        }
      } catch {
        return 'Invalid DES key format. Please use a Base64-encoded 8-byte key.';
      }

    case 'CHACHA20':
      try {
        const decoded = base64ToArrayBuffer(key);
        if (decoded.byteLength === 32) {
          return 'Valid ChaCha20 key (256-bit)';
        } else {
          return 'ChaCha20 key must be exactly 32 bytes (256 bits) when Base64 decoded';
        }
      } catch {
        return 'Invalid ChaCha20 key format. Please use a Base64-encoded 32-byte key.';
      }

    default:
      return 'Unknown algorithm';
  }
};
