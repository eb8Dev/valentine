import LZString from 'lz-string';
import CryptoJS from 'crypto-js';

// Encode data to a URL-safe string
export function encodeData(data, pin = "") {
  try {
    const jsonString = JSON.stringify(data);
    
    if (pin) {
      // Encrypt
      const encrypted = CryptoJS.AES.encrypt(jsonString, pin).toString();
      // Mark as encrypted with a prefix
      const compressed = LZString.compressToEncodedURIComponent(encrypted);
      return `enc_${compressed}`;
    } else {
      // Just compress
      const compressed = LZString.compressToEncodedURIComponent(jsonString);
      return `raw_${compressed}`;
    }
  } catch (e) {
    console.error("Encoding failed", e);
    return "";
  }
}

// Decode data from the URL param
// Returns { success: boolean, data: object | null, requiresPin: boolean }
export function decodeData(paramString, pin = "") {
  if (!paramString) return { success: false, requiresPin: false };

  try {
    if (paramString.startsWith("enc_")) {
      // It's encrypted
      if (!pin) return { success: false, requiresPin: true };
      
      const compressed = paramString.slice(4);
      const encrypted = LZString.decompressFromEncodedURIComponent(compressed);
      
      if (!encrypted) return { success: false, requiresPin: true }; // Decompression failed or empty

      const bytes = CryptoJS.AES.decrypt(encrypted, pin);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) return { success: false, requiresPin: true, error: "Incorrect PIN" };
      
      return { success: true, data: JSON.parse(decryptedString), requiresPin: false };
    } 
    else if (paramString.startsWith("raw_")) {
      // It's just compressed
      const compressed = paramString.slice(4);
      const jsonString = LZString.decompressFromEncodedURIComponent(compressed);
      return { success: true, data: JSON.parse(jsonString), requiresPin: false };
    }
    
    // Fallback for legacy (params-based) - handled outside this util usually,
    // but if we want to be strict we return false.
    return { success: false, requiresPin: false };

  } catch (e) {
    console.error("Decoding failed", e);
    return { success: false, requiresPin: false, error: "Invalid Data" };
  }
}