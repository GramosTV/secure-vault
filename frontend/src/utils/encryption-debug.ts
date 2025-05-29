/**
 * Utility functions for debugging encryption issues
 */

/**
 * Safely prints key information for debugging without revealing the entire key
 * @param key - The Base64 encoded key to debug
 * @param algorithm - The encryption algorithm this key is for
 * @returns A safe debug string with key details
 */
export const debugKey = (key: string, algorithm: 'AES' | 'DES' | 'CHACHA20'): string => {
  try {
    // First, try to decode the key from Base64
    const binary = atob(key);

    // Create a masked version of the key
    let maskedKey = '';
    if (key.length > 8) {
      maskedKey = `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    } else {
      maskedKey = '****';
    }

    // Return details about the key without revealing its contents
    return `${algorithm} Key: ${maskedKey} (${binary.length} bytes, ${binary.length * 8} bits)`;
  } catch (e) {
    return `Invalid Base64 encoded ${algorithm} key`;
  }
};

/**
 * Tests whether two keys are identical
 * @param key1 - First key to compare
 * @param key2 - Second key to compare
 * @returns Whether the keys are identical
 */
export const compareKeys = (key1: string, key2: string): boolean => {
  try {
    // Decode both keys
    const binary1 = atob(key1);
    const binary2 = atob(key2);

    // Compare lengths first
    if (binary1.length !== binary2.length) {
      console.log(`Key length mismatch: ${binary1.length} vs ${binary2.length} bytes`);
      return false;
    }

    // Compare each byte
    for (let i = 0; i < binary1.length; i++) {
      if (binary1.charCodeAt(i) !== binary2.charCodeAt(i)) {
        console.log(`Key difference at byte ${i}: ${binary1.charCodeAt(i)} vs ${binary2.charCodeAt(i)}`);
        return false;
      }
    }

    return true;
  } catch (e) {
    console.error('Error comparing keys:', e);
    return false;
  }
};

/**
 * Debug ChaCha20 key format issues
 * @param key - The ChaCha20 key to debug
 * @returns Information about key format issues
 */
export const debugChaCha20Key = (key: string): string => {
  // Try to decode as Base64
  let isValidBase64 = false;
  let decodedLength = 0;

  try {
    // Clean the key by removing whitespace
    const cleanedKey = key.replace(/\s+/g, '');
    const decoded = atob(cleanedKey);
    isValidBase64 = true;
    decodedLength = decoded.length;
  } catch (e) {
    isValidBase64 = false;
  }

  const expectedLength = 32; // ChaCha20 uses 32-byte keys
  const isCorrectLength = decodedLength === expectedLength;

  return `ChaCha20 Key Analysis:
  - Valid Base64: ${isValidBase64}
  - Decoded Length: ${decodedLength} bytes (expected: ${expectedLength})
  - Correct Length: ${isCorrectLength}
  - Total Length: ${key.length} characters`;
};
