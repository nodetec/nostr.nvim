import {
  hexToBytes
} from "./chunk-SLYNB64A.js";

// src/lib/note.ts
import { SimplePool } from "nostr-tools/pool";
import { finalizeEvent } from "nostr-tools/pure";
import { decode } from "nostr-tools/nip19";
async function postNote(privateKeyHex, content, relays) {
  const pool = new SimplePool();
  try {
    const privateKey = hexToBytes(privateKeyHex);
    const event = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1e3),
        tags: [],
        content
      },
      privateKey
    );
    const results = await Promise.allSettled(pool.publish(relays, event));
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    if (succeeded === 0) {
      throw new Error(`Failed to publish to all ${relays.length} relay(s)`);
    }
    return event.id;
  } finally {
    pool.close(relays);
  }
}
async function getNotesForPubkey(pubkey, relays, limit = 20) {
  const pool = new SimplePool();
  const notes = [];
  try {
    const events = await pool.querySync(relays, {
      kinds: [1],
      authors: [pubkey],
      limit
    });
    for (const event of events) {
      notes.push({
        id: event.id,
        pubkey: event.pubkey,
        content: event.content,
        created_at: event.created_at
      });
    }
    notes.sort((a, b) => b.created_at - a.created_at);
    return notes;
  } finally {
    pool.close(relays);
  }
}
function parsePubkey(input) {
  if (input.startsWith("npub")) {
    const decoded = decode(input);
    if (decoded.type === "npub") {
      return decoded.data;
    }
    throw new Error("Invalid npub");
  }
  if (!/^[0-9a-f]{64}$/i.test(input)) {
    throw new Error("Invalid public key format. Use npub or hex.");
  }
  return input.toLowerCase();
}
function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1e3);
  return date.toLocaleString();
}
export {
  formatTimestamp,
  getNotesForPubkey,
  parsePubkey,
  postNote
};
