export interface RelayConfig {
  url: string;
  read: boolean;
  write: boolean;
}

export interface NostrConfig {
  privateKey?: string; // hex format
  publicKey?: string; // hex format
  relays?: RelayConfig[] | string[]; // Support both old and new format
}

export interface NostrKeys {
  privateKey: string; // hex format
  publicKey: string; // hex format
  nsec: string; // bech32 format
  npub: string; // bech32 format
}
