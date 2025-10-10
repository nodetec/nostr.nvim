import { SimplePool } from "nostr-tools/pool";
import { finalizeEvent } from "nostr-tools/pure";
import { hexToBytes } from "@noble/hashes/utils";
import { decode } from "nostr-tools/nip19";

export interface Note {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
}

export async function postNote(
  privateKeyHex: string,
  content: string,
  relays: string[],
): Promise<string> {
  const pool = new SimplePool();

  try {
    const privateKey = hexToBytes(privateKeyHex);

    // Create kind:1 text note
    const event = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content,
      },
      privateKey,
    );

    // Publish to all relays
    const results = await Promise.allSettled(pool.publish(relays, event));

    // Check if at least one relay succeeded
    const succeeded = results.filter((r) => r.status === "fulfilled").length;

    if (succeeded === 0) {
      throw new Error(`Failed to publish to all ${relays.length} relay(s)`);
    }

    return event.id;
  } finally {
    pool.close(relays);
  }
}

export async function getNotesForPubkey(
  pubkey: string,
  relays: string[],
  limit: number = 20,
): Promise<Note[]> {
  const pool = new SimplePool();
  const notes: Note[] = [];

  try {
    // Query for kind:1 notes from the specified author
    const events = await pool.querySync(relays, {
      kinds: [1],
      authors: [pubkey],
      limit,
    });

    // Convert events to notes
    for (const event of events) {
      notes.push({
        id: event.id,
        pubkey: event.pubkey,
        content: event.content,
        created_at: event.created_at,
      });
    }

    // Sort by timestamp, newest first
    notes.sort((a, b) => b.created_at - a.created_at);

    return notes;
  } finally {
    pool.close(relays);
  }
}

export function parsePubkey(input: string): string {
  // If it starts with npub, decode it
  if (input.startsWith("npub")) {
    const decoded = decode(input);
    if (decoded.type === "npub") {
      return decoded.data;
    }
    throw new Error("Invalid npub");
  }

  // Otherwise assume it's hex
  if (!/^[0-9a-f]{64}$/i.test(input)) {
    throw new Error("Invalid public key format. Use npub or hex.");
  }

  return input.toLowerCase();
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}
