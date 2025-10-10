import { generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { nsecEncode, npubEncode, decode } from "nostr-tools/nip19";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import type { NostrKeys } from "../types/index.js";

export function generateKeys(): NostrKeys {
  const privateKeyBytes = generateSecretKey();
  const privateKey = bytesToHex(privateKeyBytes);
  const publicKey = getPublicKey(privateKeyBytes);

  return {
    privateKey,
    publicKey,
    nsec: nsecEncode(privateKeyBytes),
    npub: npubEncode(publicKey),
  };
}

export function importNsec(nsec: string): NostrKeys {
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
      npub: npubEncode(publicKey),
    };
  } catch (error) {
    throw new Error(`Failed to import nsec: ${error}`);
  }
}

export function getKeysFromHex(privateKeyHex: string): NostrKeys {
  try {
    const privateKeyBytes = hexToBytes(privateKeyHex);
    const publicKey = getPublicKey(privateKeyBytes);

    return {
      privateKey: privateKeyHex,
      publicKey,
      nsec: nsecEncode(privateKeyBytes),
      npub: npubEncode(publicKey),
    };
  } catch (error) {
    throw new Error(`Failed to load keys from hex: ${error}`);
  }
}
