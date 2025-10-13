import {
  bytesToHex,
  hexToBytes
} from "./chunk-SLYNB64A.js";

// src/lib/keys.ts
import { generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { nsecEncode, npubEncode, decode } from "nostr-tools/nip19";
function generateKeys() {
  const privateKeyBytes = generateSecretKey();
  const privateKey = bytesToHex(privateKeyBytes);
  const publicKey = getPublicKey(privateKeyBytes);
  return {
    privateKey,
    publicKey,
    nsec: nsecEncode(privateKeyBytes),
    npub: npubEncode(publicKey)
  };
}
function importNsec(nsec) {
  try {
    const decoded = decode(nsec);
    if (decoded.type !== "nsec") {
      throw new Error("Invalid nsec key");
    }
    const privateKeyBytes = decoded.data;
    const privateKey = bytesToHex(privateKeyBytes);
    const publicKey = getPublicKey(privateKeyBytes);
    return {
      privateKey,
      publicKey,
      nsec: nsecEncode(privateKeyBytes),
      npub: npubEncode(publicKey)
    };
  } catch (error) {
    throw new Error(`Failed to import nsec: ${error}`);
  }
}
function getKeysFromHex(privateKeyHex) {
  try {
    const privateKeyBytes = hexToBytes(privateKeyHex);
    const publicKey = getPublicKey(privateKeyBytes);
    return {
      privateKey: privateKeyHex,
      publicKey,
      nsec: nsecEncode(privateKeyBytes),
      npub: npubEncode(publicKey)
    };
  } catch (error) {
    throw new Error(`Failed to load keys from hex: ${error}`);
  }
}

export {
  generateKeys,
  importNsec,
  getKeysFromHex
};
