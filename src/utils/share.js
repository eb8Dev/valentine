import LZString from 'lz-string';
import CryptoJS from 'crypto-js';

// Minification mapping to reduce URL length
const KEY_MAP = {
  from: 'f', to: 't', msg: 'm', about: 'a', reasons: 'r', world: 'w', vibe: 'v', 
  template: 'te', moments: 'mo', photos: 'p', question: 'q', 
  date: 'd', title: 'ti', description: 'de', photo: 'ph'
};

const REVERSE_MAP = Object.entries(KEY_MAP).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

function minify(data) {
  if (Array.isArray(data)) return data.map(minify);
  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      const minKey = KEY_MAP[key] || key;
      acc[minKey] = minify(data[key]);
      return acc;
    }, {});
  }
  return data;
}

function unminify(data) {
  if (Array.isArray(data)) return data.map(unminify);
  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      const fullKey = REVERSE_MAP[key] || key;
      acc[fullKey] = unminify(data[key]);
      return acc;
    }, {});
  }
  return data;
}

// Encode data to a URL-safe string
export function encodeData(data, pin = "") {
  try {
    const minifiedData = minify(data);
    const jsonString = JSON.stringify(minifiedData);
    
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
    let jsonString;
    let isEncrypted = false;

    if (paramString.startsWith("enc_")) {
      isEncrypted = true;
      // It's encrypted
      if (!pin) return { success: false, requiresPin: true };
      
      const compressed = paramString.slice(4);
      const encrypted = LZString.decompressFromEncodedURIComponent(compressed);
      
      if (!encrypted) return { success: false, requiresPin: true }; // Decompression failed or empty

      const bytes = CryptoJS.AES.decrypt(encrypted, pin);
      jsonString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) return { success: false, requiresPin: true, error: "Incorrect PIN" };
      
    } 
    else if (paramString.startsWith("raw_")) {
      // It's just compressed
      const compressed = paramString.slice(4);
      jsonString = LZString.decompressFromEncodedURIComponent(compressed);
    }
    else {
      // Fallback for legacy (params-based) - handled outside this util usually,
      // but if we want to be strict we return false.
      return { success: false, requiresPin: false };
    }

    if (!jsonString) return { success: false, requiresPin: false, error: "Invalid data after decompression" };

    const minifiedData = JSON.parse(jsonString);
    // Check if data seems minified (has keys like 'f', 't', 'mo') or is legacy
    // We assume if it parses, we try to unminify. If it was old data, unminify might just return it as is if keys don't match, 
    // BUT old data has keys 'from', 'to'. 'unminify' looks for 'f', 't'. 
    // If we pass old data to unminify, it won't find 'from' in REVERSE_MAP (values are 'f'), so it keeps 'from'.
    // So unminify is safe for legacy data too!
    const data = unminify(minifiedData);
    
    return { success: true, data, requiresPin: false };

  } catch (e) {
    console.error("Decoding failed", e);
    return { success: false, requiresPin: false, error: "Invalid Data" };
  }
}