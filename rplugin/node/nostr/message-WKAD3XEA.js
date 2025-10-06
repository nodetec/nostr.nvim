import {
  hexToBytes
} from "./chunk-SLYNB64A.js";

// src/lib/message.ts
import { SimplePool } from "nostr-tools/pool";
import * as nip17 from "nostr-tools/nip17";
import { decode } from "nostr-tools/nip19";
import { getPublicKey } from "nostr-tools/pure";
async function sendMessage(privateKeyHex, recipientPubkey, message, relays) {
  const pool = new SimplePool();
  try {
    const privateKey = hexToBytes(privateKeyHex);
    const senderPubkey = getPublicKey(privateKey);
    const wrappedEvents = nip17.wrapManyEvents(
      privateKey,
      [
        { publicKey: recipientPubkey },
        { publicKey: senderPubkey }
      ],
      message
    );
    for (const event of wrappedEvents) {
      await Promise.any(pool.publish(relays, event));
    }
  } finally {
    pool.close(relays);
  }
}
async function receiveMessages(privateKeyHex, relays, limit = 20) {
  const pool = new SimplePool();
  const messages = [];
  try {
    const privateKey = hexToBytes(privateKeyHex);
    const publicKey = getPublicKey(privateKey);
    const events = await pool.querySync(relays, {
      kinds: [1059],
      "#p": [publicKey],
      limit
    });
    for (const event of events) {
      try {
        const rumor = nip17.unwrapEvent(event, privateKey);
        messages.push({
          id: rumor.id,
          from: rumor.pubkey,
          content: rumor.content,
          created_at: rumor.created_at
        });
      } catch (error) {
        continue;
      }
    }
    messages.sort((a, b) => b.created_at - a.created_at);
    return messages;
  } finally {
    pool.close(relays);
  }
}
function parseRecipient(input) {
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
  parseRecipient,
  receiveMessages,
  sendMessage
};
