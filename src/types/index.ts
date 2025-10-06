export interface NostrConfig {
  privateKey?: string; // hex format
  publicKey?: string; // hex format
  relays?: string[];
}

export interface NostrKeys {
  privateKey: string; // hex format
  publicKey: string; // hex format
  nsec: string; // bech32 format
  npub: string; // bech32 format
}
