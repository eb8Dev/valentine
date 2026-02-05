import LZString from 'lz-string';
import CryptoJS from 'crypto-js';

// Minification mapping to reduce URL length
const KEY_MAP = {
  from: 'f', to: 't', msg: 'm', about: 'a', reasons: 'r', world: 'w', vibe: 'v', 
  template: 'te', moments: 'mo', photos: 'p', question: 'q', 
  date: 'd', title: 'ti', description: 'de', photo: 'ph'
};

const REVERSE_MAP = Object.entries(KEY_MAP).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

function prune(obj) {
  if (Array.isArray(obj)) {
    return obj
      .map(prune)
      .filter(v => v !== null && v !== undefined && v !== "");
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      const val = prune(obj[key]);
      if (val !== null && val !== undefined && val !== "" && (typeof val !== 'object' || Object.keys(val).length > 0)) {
        acc[key] = val;
      }
      return acc;
    }, {});
  }
  return obj;
}

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

export function encodeData(data, pin = "") {
  try {
    const prunedData = prune(data);
    const minifiedData = minify(prunedData);
    const jsonString = JSON.stringify(minifiedData);
    
    if (pin) {
      const encrypted = CryptoJS.AES.encrypt(jsonString, pin).toString();
      return `enc_${LZString.compressToEncodedURIComponent(encrypted)}`;
    }
    
    return LZString.compressToEncodedURIComponent(jsonString);
  } catch (e) {
    console.error("Encoding failed", e);
    return null;
  }
}

export function decodeData(encodedString, pin = "") {
  try {
    if (!encodedString) return { success: false, error: "No data" };

    const isEncrypted = encodedString.startsWith("enc_");
    const payload = isEncrypted ? encodedString.slice(4) : encodedString;
    
    if (isEncrypted && !pin) {
      return { success: false, requiresPin: true };
    }

    let jsonString;
    
    if (isEncrypted) {
      const decompressed = LZString.decompressFromEncodedURIComponent(payload);
      const bytes = CryptoJS.AES.decrypt(decompressed, pin);
      jsonString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) return { success: false, error: "Incorrect PIN" };
    } else {
      jsonString = LZString.decompressFromEncodedURIComponent(payload);
    }

    if (!jsonString) return { success: false, error: "Invalid data" };

    const minifiedData = JSON.parse(jsonString);
    const data = unminify(minifiedData);
    
    return { success: true, data };
  } catch (e) {
    console.error("Decoding failed", e);
    return { success: false, error: "Decryption failed" };
  }
}