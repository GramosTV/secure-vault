import type { EncryptionAlgorithm } from '../types/constants';

export const generateAESKey = (keySize: 128 | 192 | 256 = 256): string => {
  const keyBytes = keySize / 8;
  const key = new Uint8Array(keyBytes);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(key);
  } else {
    for (let i = 0; i < keyBytes; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }
  }

  return arrayBufferToBase64(key.buffer);
};

export const textToAESKey = (textKey: string, keySize: 128 | 192 | 256 = 256): string => {
  const keyBytes = keySize / 8;
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(textKey);

  const key = new Uint8Array(keyBytes);

  if (textBytes.length >= keyBytes) {
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

export const isValidBase64Key = (key: string, algorithm?: 'AES' | 'DES' | 'CHACHA20'): boolean => {
  try {
    const decoded = base64ToArrayBuffer(key);

    if (algorithm === 'DES') {
      return decoded.byteLength === 8; // 64 bits
    } else if (algorithm === 'CHACHA20') {
      return decoded.byteLength === 32; // 256 bits
    } else {
      const validLengths = [16, 24, 32]; // 128, 192, 256 bits for AES
      return validLengths.includes(decoded.byteLength);
    }
  } catch {
    return false;
  }
};

export const getKeySize = (base64Key: string): number | null => {
  try {
    const decoded = base64ToArrayBuffer(base64Key);
    return decoded.byteLength * 8;
  } catch {
    return null;
  }
};

export const generateChaCha20Key = (): string => {
  const key = new Uint8Array(32); // ChaCha20 uses 32-byte keys

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(key);
  } else {
    for (let i = 0; i < 32; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }
  }

  return arrayBufferToBase64(key.buffer);
};

export const textToChaCha20Key = (textKey: string): string => {
  const keyBytes = 32; // ChaCha20 requires 32 bytes
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(textKey);
  const key = new Uint8Array(keyBytes);

  if (textBytes.length >= keyBytes) {
    key.set(textBytes.slice(0, keyBytes));
  } else {
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
  const textEncoder = new TextEncoder();
  const bytes = textEncoder.encode(textKey);
  const desKeyBytes = new Uint8Array(8);

  if (bytes.length === 0) {
    for (let i = 0; i < 8; i++) {
      desKeyBytes[i] = 0;
    }
  } else if (bytes.length === 8) {
    desKeyBytes.set(bytes);
  } else if (bytes.length < 8) {
    let pos = 0;
    while (pos < 8) {
      const bytesToCopy = Math.min(bytes.length, 8 - pos);
      desKeyBytes.set(bytes.subarray(0, bytesToCopy), pos);
      pos += bytesToCopy;
    }
  } else {
    for (let i = 0; i < bytes.length; i++) {
      desKeyBytes[i % 8] ^= bytes[i];
    }
  }

  return arrayBufferToBase64(desKeyBytes.buffer);
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const getKeyValidationMessage = (algorithm: EncryptionAlgorithm, key: string): string | null => {
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
