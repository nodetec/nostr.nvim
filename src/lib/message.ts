import { SimplePool } from 'nostr-tools/pool';
import * as nip17 from 'nostr-tools/nip17';
import { hexToBytes } from '@noble/hashes/utils';
import { decode } from 'nostr-tools/nip19';
import { getPublicKey } from 'nostr-tools/pure';
import type { NostrEvent } from 'nostr-tools/core';

export interface Message {
  id: string;
  from: string;
  content: string;
  created_at: number;
}

export async function sendMessage(
  privateKeyHex: string,
  recipientPubkey: string,
  message: string,
  relays: string[]
): Promise<void> {
  const pool = new SimplePool();

  try {
    const privateKey = hexToBytes(privateKeyHex);
    const senderPubkey = getPublicKey(privateKey);

    // Create wrapped DMs for both sender and recipient (NIP-17)
    const wrappedEvents = nip17.wrapManyEvents(
      privateKey,
      [
        { publicKey: recipientPubkey },
        { publicKey: senderPubkey }
      ],
      message
    );

    // Publish all wrapped events to relays
    for (const event of wrappedEvents) {
      const results = await Promise.allSettled(pool.publish(relays, event));

      const succeeded = results.filter(r => r.status === 'fulfilled').length;

      if (succeeded === 0) {
        throw new Error(`Failed to publish message to all ${relays.length} relay(s)`);
      }
    }
  } finally {
    pool.close(relays);
  }
}

export async function receiveMessages(
  privateKeyHex: string,
  relays: string[],
  limit: number = 20
): Promise<Message[]> {
  const pool = new SimplePool();
  const messages: Message[] = [];

  try {
    const privateKey = hexToBytes(privateKeyHex);
    const publicKey = getPublicKey(privateKey);

    // Subscribe to kind:1059 (gift wrapped events) addressed to us
    const events = await pool.querySync(relays, {
      kinds: [1059],
      '#p': [publicKey],
      limit,
    });

    // Unwrap each event
    for (const event of events) {
      try {
        const rumor = nip17.unwrapEvent(event, privateKey);

        messages.push({
          id: rumor.id,
          from: rumor.pubkey,
          content: rumor.content,
          created_at: rumor.created_at,
        });
      } catch (error) {
        // Skip events we can't decrypt (not meant for us)
        continue;
      }
    }

    // Sort by timestamp, newest first
    messages.sort((a, b) => b.created_at - a.created_at);

    return messages;
  } finally {
    pool.close(relays);
  }
}

export function parseRecipient(input: string): string {
  // If it starts with npub, decode it
  if (input.startsWith('npub')) {
    const decoded = decode(input);
    if (decoded.type === 'npub') {
      return decoded.data;
    }
    throw new Error('Invalid npub');
  }

  // Otherwise assume it's hex
  if (!/^[0-9a-f]{64}$/i.test(input)) {
    throw new Error('Invalid public key format. Use npub or hex.');
  }

  return input.toLowerCase();
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}
