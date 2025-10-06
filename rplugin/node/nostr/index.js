"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@noble/hashes/esm/cryptoNode.js
var nc, crypto;
var init_cryptoNode = __esm({
  "node_modules/@noble/hashes/esm/cryptoNode.js"() {
    "use strict";
    nc = __toESM(require("crypto"), 1);
    crypto = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : void 0;
  }
});

// node_modules/@noble/hashes/esm/utils.js
function bytesToHex(bytes) {
  if (!u8a(bytes))
    throw new Error("Uint8Array expected");
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  const len = hex.length;
  if (len % 2)
    throw new Error("padded hex string expected, got unpadded hex of length " + len);
  const array = new Uint8Array(len / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0)
      throw new Error("Invalid byte sequence");
    array[i] = byte;
  }
  return array;
}
var u8a, isLE, hexes;
var init_utils = __esm({
  "node_modules/@noble/hashes/esm/utils.js"() {
    "use strict";
    init_cryptoNode();
    u8a = (a) => a instanceof Uint8Array;
    isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
    if (!isLE)
      throw new Error("Non little-endian hardware is not supported");
    hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
  }
});

// src/lib/keys.ts
var keys_exports = {};
__export(keys_exports, {
  generateKeys: () => generateKeys,
  getKeysFromHex: () => getKeysFromHex,
  importNsec: () => importNsec
});
function generateKeys() {
  const privateKeyBytes = (0, import_pure.generateSecretKey)();
  const privateKey = bytesToHex(privateKeyBytes);
  const publicKey = (0, import_pure.getPublicKey)(privateKeyBytes);
  return {
    privateKey,
    publicKey,
    nsec: (0, import_nip19.nsecEncode)(privateKeyBytes),
    npub: (0, import_nip19.npubEncode)(publicKey)
  };
}
function importNsec(nsec) {
  try {
    const decoded = (0, import_nip19.decode)(nsec);
    if (decoded.type !== "nsec") {
      throw new Error("Invalid nsec key");
    }
    const privateKeyBytes = decoded.data;
    const privateKey = bytesToHex(privateKeyBytes);
    const publicKey = (0, import_pure.getPublicKey)(privateKeyBytes);
    return {
      privateKey,
      publicKey,
      nsec: (0, import_nip19.nsecEncode)(privateKeyBytes),
      npub: (0, import_nip19.npubEncode)(publicKey)
    };
  } catch (error) {
    throw new Error(`Failed to import nsec: ${error}`);
  }
}
function getKeysFromHex(privateKeyHex) {
  try {
    const privateKeyBytes = hexToBytes(privateKeyHex);
    const publicKey = (0, import_pure.getPublicKey)(privateKeyBytes);
    return {
      privateKey: privateKeyHex,
      publicKey,
      nsec: (0, import_nip19.nsecEncode)(privateKeyBytes),
      npub: (0, import_nip19.npubEncode)(publicKey)
    };
  } catch (error) {
    throw new Error(`Failed to load keys from hex: ${error}`);
  }
}
var import_pure, import_nip19;
var init_keys = __esm({
  "src/lib/keys.ts"() {
    "use strict";
    import_pure = require("nostr-tools/pure");
    import_nip19 = require("nostr-tools/nip19");
    init_utils();
  }
});

// src/lib/message.ts
var message_exports = {};
__export(message_exports, {
  formatTimestamp: () => formatTimestamp,
  parseRecipient: () => parseRecipient,
  receiveMessages: () => receiveMessages,
  sendMessage: () => sendMessage
});
async function sendMessage(privateKeyHex, recipientPubkey, message, relays) {
  const pool = new import_pool.SimplePool();
  try {
    const privateKey = hexToBytes(privateKeyHex);
    const senderPubkey = (0, import_pure2.getPublicKey)(privateKey);
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
  const pool = new import_pool.SimplePool();
  const messages = [];
  try {
    const privateKey = hexToBytes(privateKeyHex);
    const publicKey = (0, import_pure2.getPublicKey)(privateKey);
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
    const decoded = (0, import_nip192.decode)(input);
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
var import_pool, nip17, import_nip192, import_pure2;
var init_message = __esm({
  "src/lib/message.ts"() {
    "use strict";
    import_pool = require("nostr-tools/pool");
    nip17 = __toESM(require("nostr-tools/nip17"));
    init_utils();
    import_nip192 = require("nostr-tools/nip19");
    import_pure2 = require("nostr-tools/pure");
  }
});

// src/lib/note.ts
var note_exports = {};
__export(note_exports, {
  formatTimestamp: () => formatTimestamp2,
  getNotesForPubkey: () => getNotesForPubkey,
  parsePubkey: () => parsePubkey,
  postNote: () => postNote
});
async function postNote(privateKeyHex, content, relays) {
  const pool = new import_pool2.SimplePool();
  try {
    const privateKey = hexToBytes(privateKeyHex);
    const event = (0, import_pure3.finalizeEvent)(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1e3),
        tags: [],
        content
      },
      privateKey
    );
    await Promise.any(pool.publish(relays, event));
    return event.id;
  } finally {
    pool.close(relays);
  }
}
async function getNotesForPubkey(pubkey, relays, limit = 20) {
  const pool = new import_pool2.SimplePool();
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
    const decoded = (0, import_nip193.decode)(input);
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
function formatTimestamp2(timestamp) {
  const date = new Date(timestamp * 1e3);
  return date.toLocaleString();
}
var import_pool2, import_pure3, import_nip193;
var init_note = __esm({
  "src/lib/note.ts"() {
    "use strict";
    import_pool2 = require("nostr-tools/pool");
    import_pure3 = require("nostr-tools/pure");
    init_utils();
    import_nip193 = require("nostr-tools/nip19");
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
init_keys();

// src/lib/config.ts
var import_promises = require("fs/promises");
var import_fs = require("fs");
var import_path = require("path");
var import_os = require("os");
var CONFIG_DIR = (0, import_path.join)((0, import_os.homedir)(), ".config", "nostr.nvim");
var CONFIG_FILE = (0, import_path.join)(CONFIG_DIR, "config.json");
async function loadConfig() {
  try {
    if (!(0, import_fs.existsSync)(CONFIG_FILE)) {
      return {};
    }
    const data = await (0, import_promises.readFile)(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}
async function saveConfig(config) {
  try {
    if (!(0, import_fs.existsSync)(CONFIG_DIR)) {
      await (0, import_promises.mkdir)(CONFIG_DIR, { recursive: true });
    }
    await (0, import_promises.writeFile)(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    throw new Error(`Failed to save config: ${error}`);
  }
}

// src/index.ts
function index_default(plugin) {
  plugin.registerCommand(
    "NostrInit",
    async () => {
      try {
        const keys = generateKeys();
        const defaultRelays = ["wss://relay.damus.io"];
        const config = await loadConfig();
        config.privateKey = keys.privateKey;
        config.publicKey = keys.publicKey;
        config.relays = defaultRelays;
        await saveConfig(config);
        await plugin.nvim.outWrite(
          `Nostr configuration initialized!

Public Key (npub): ${keys.npub}
Keep your nsec private: ${keys.nsec}

Relays:
` + defaultRelays.map((r) => `  - ${r}`).join("\n") + `

Configuration saved to ~/.config/nostr.nvim/config.json
`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error initializing config: ${error}
`);
      }
    },
    { sync: false }
  );
  plugin.registerCommand(
    "NostrGenerateKeys",
    async () => {
      try {
        const keys = generateKeys();
        const config = await loadConfig();
        config.privateKey = keys.privateKey;
        config.publicKey = keys.publicKey;
        await saveConfig(config);
        await plugin.nvim.outWrite(
          `Keys generated successfully!

Public Key (npub): ${keys.npub}

Your keys have been saved to ~/.config/nostr.nvim/config.json
Keep your nsec private: ${keys.nsec}
`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error generating keys: ${error}
`);
      }
    },
    { sync: false }
  );
  plugin.registerCommand(
    "NostrImportKey",
    async (args) => {
      try {
        if (args.length === 0) {
          await plugin.nvim.errWrite(
            "Usage: :NostrImportKey <nsec>\nExample: :NostrImportKey nsec1...\n"
          );
          return;
        }
        const nsec = args[0];
        const keys = importNsec(nsec);
        const config = await loadConfig();
        config.privateKey = keys.privateKey;
        config.publicKey = keys.publicKey;
        await saveConfig(config);
        await plugin.nvim.outWrite(
          `Keys imported successfully!

Public Key (npub): ${keys.npub}

Your keys have been saved to ~/.config/nostr.nvim/config.json
`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error importing key: ${error}
`);
      }
    },
    { sync: false, nargs: "*" }
  );
  plugin.registerCommand(
    "NostrShowPubkey",
    async () => {
      try {
        const config = await loadConfig();
        if (!config.publicKey) {
          await plugin.nvim.outWrite(
            "No keys found. Generate keys with :NostrGenerateKeys or import with :NostrImportKey\n"
          );
          return;
        }
        const { getKeysFromHex: getKeysFromHex2 } = await Promise.resolve().then(() => (init_keys(), keys_exports));
        const keys = getKeysFromHex2(config.publicKey);
        await plugin.nvim.outWrite(
          `Your public key (npub): ${keys.npub}
Hex: ${keys.publicKey}
`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error showing pubkey: ${error}
`);
      }
    },
    { sync: false }
  );
  plugin.registerCommand(
    "NostrGetNpub",
    async () => {
      try {
        const config = await loadConfig();
        if (!config.publicKey) {
          await plugin.nvim.errWrite(
            "No keys found. Generate keys with :NostrGenerateKeys or import with :NostrImportKey\n"
          );
          return;
        }
        const { npubEncode: npubEncode2 } = await import("nostr-tools/nip19");
        const npub = npubEncode2(config.publicKey);
        await plugin.nvim.call("setreg", ["+", npub]);
        await plugin.nvim.outWrite(`${npub}
(Copied to clipboard)
`);
      } catch (error) {
        await plugin.nvim.errWrite(`Error getting npub: ${error}
`);
      }
    },
    { sync: false }
  );
  plugin.registerCommand(
    "NostrSetupRelay",
    async () => {
      try {
        const config = await loadConfig();
        const defaultRelays = ["wss://relay.damus.io"];
        config.relays = defaultRelays;
        await saveConfig(config);
        await plugin.nvim.outWrite(
          `Default relay configured!

Relays:
` + defaultRelays.map((r) => `  - ${r}`).join("\n") + `

Relay configuration saved to ~/.config/nostr.nvim/config.json
`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error setting up relay: ${error}
`);
      }
    },
    { sync: false }
  );
  plugin.registerCommand(
    "NostrSendDM",
    async (args) => {
      try {
        if (args.length < 2) {
          await plugin.nvim.errWrite(
            "Usage: :NostrSendDM <npub/hex> <message>\nExample: :NostrSendDM npub1... Hello from Neovim!\n"
          );
          return;
        }
        const config = await loadConfig();
        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            "No keys found. Run :NostrInit or :NostrGenerateKeys first.\n"
          );
          return;
        }
        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            "No relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
          );
          return;
        }
        const { parseRecipient: parseRecipient2, sendMessage: sendMessage2 } = await Promise.resolve().then(() => (init_message(), message_exports));
        const recipientInput = args[0];
        const message = args.slice(1).join(" ");
        const recipientPubkey = parseRecipient2(recipientInput);
        await plugin.nvim.outWrite("Sending encrypted message...\n");
        await sendMessage2(
          config.privateKey,
          recipientPubkey,
          message,
          config.relays
        );
        await plugin.nvim.outWrite("Message sent successfully!\n");
      } catch (error) {
        await plugin.nvim.errWrite(`Error sending message: ${error}
`);
      }
    },
    { sync: false, nargs: "*" }
  );
  plugin.registerCommand(
    "NostrCheckDMs",
    async () => {
      try {
        const config = await loadConfig();
        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            "No keys found. Run :NostrInit or :NostrGenerateKeys first.\n"
          );
          return;
        }
        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            "No relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
          );
          return;
        }
        const { receiveMessages: receiveMessages2, formatTimestamp: formatTimestamp3 } = await Promise.resolve().then(() => (init_message(), message_exports));
        const { npubEncode: npubEncode2 } = await import("nostr-tools/nip19");
        await plugin.nvim.outWrite("Fetching messages from relays...\n");
        const messages = await receiveMessages2(
          config.privateKey,
          config.relays,
          20
        );
        if (messages.length === 0) {
          await plugin.nvim.outWrite("No messages found.\n");
          return;
        }
        const lines = [
          `Nostr Direct Messages (${messages.length} message${messages.length > 1 ? "s" : ""})`,
          "=".repeat(80),
          ""
        ];
        for (const msg of messages) {
          const fromNpub = npubEncode2(msg.from);
          const timestamp = formatTimestamp3(msg.created_at);
          lines.push(`From: ${fromNpub}`);
          lines.push(`Time: ${timestamp}`);
          lines.push("");
          const contentLines = msg.content.split("\n");
          lines.push(...contentLines);
          lines.push("");
          lines.push("-".repeat(80));
          lines.push("");
        }
        lines.push("");
        lines.push("Press q to close");
        const buf = await plugin.nvim.createBuffer(false, true);
        await buf.setLines(lines, { start: 0, end: -1, strictIndexing: false });
        await buf.setOption("modifiable", false);
        await buf.setOption("buftype", "nofile");
        await buf.setOption("bufhidden", "wipe");
        await buf.setOption("filetype", "nostr-messages");
        const width = await plugin.nvim.getOption("columns");
        const height = await plugin.nvim.getOption("lines");
        const winWidth = Math.floor(width * 0.8);
        const winHeight = Math.floor(height * 0.8);
        const row = Math.floor((height - winHeight) / 2);
        const col = Math.floor((width - winWidth) / 2);
        const win = await plugin.nvim.openWindow(buf, true, {
          relative: "editor",
          width: winWidth,
          height: winHeight,
          row,
          col,
          style: "minimal",
          border: "rounded"
        });
        await win.setOption("wrap", true);
        await win.setOption("cursorline", true);
        await plugin.nvim.command(
          `autocmd BufLeave <buffer=${buf.id}> ++once lua vim.api.nvim_win_close(${win.id}, true)`
        );
        await buf.setKeymap("n", "q", ":close<CR>", {
          noremap: true,
          silent: true
        });
      } catch (error) {
        await plugin.nvim.errWrite(`Error checking messages: ${error}
`);
      }
    },
    { sync: false }
  );
  plugin.registerCommand(
    "NostrPostNote",
    async (args) => {
      try {
        if (args.length === 0) {
          await plugin.nvim.errWrite(
            "Usage: :NostrPostNote <message>\nExample: :NostrPostNote Hello Nostr from Neovim!\n"
          );
          return;
        }
        const config = await loadConfig();
        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            "No keys found. Run :NostrInit or :NostrGenerateKeys first.\n"
          );
          return;
        }
        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            "No relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
          );
          return;
        }
        const { postNote: postNote2 } = await Promise.resolve().then(() => (init_note(), note_exports));
        const content = args.join(" ");
        await plugin.nvim.outWrite("Publishing note to Nostr...\n");
        const eventId = await postNote2(
          config.privateKey,
          content,
          config.relays
        );
        await plugin.nvim.outWrite(
          `Note published successfully!
Event ID: ${eventId}
`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error posting note: ${error}
`);
      }
    },
    { sync: false, nargs: "*" }
  );
  plugin.registerCommand(
    "NostrGetNotes",
    async (args) => {
      try {
        if (args.length === 0) {
          await plugin.nvim.errWrite(
            "Usage: :NostrGetNotes <npub/hex>\nExample: :NostrGetNotes npub1...\n"
          );
          return;
        }
        const config = await loadConfig();
        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            "No relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
          );
          return;
        }
        const { getNotesForPubkey: getNotesForPubkey2, parsePubkey: parsePubkey2, formatTimestamp: formatTimestamp3 } = await Promise.resolve().then(() => (init_note(), note_exports));
        const { npubEncode: npubEncode2 } = await import("nostr-tools/nip19");
        const pubkeyInput = args[0];
        const pubkey = parsePubkey2(pubkeyInput);
        await plugin.nvim.outWrite("Fetching notes from relays...\n");
        const notes = await getNotesForPubkey2(
          pubkey,
          config.relays,
          20
        );
        if (notes.length === 0) {
          await plugin.nvim.outWrite("No notes found for this user.\n");
          return;
        }
        const npub = npubEncode2(pubkey);
        const lines = [
          `Notes from ${npub}`,
          "=".repeat(80),
          `${notes.length} note${notes.length > 1 ? "s" : ""}`,
          ""
        ];
        for (const note of notes) {
          const timestamp = formatTimestamp3(note.created_at);
          lines.push(`Posted: ${timestamp}`);
          lines.push("");
          const contentLines = note.content.split("\n");
          lines.push(...contentLines);
          lines.push("");
          lines.push("-".repeat(80));
          lines.push("");
        }
        lines.push("");
        lines.push("Press q to close");
        const buf = await plugin.nvim.createBuffer(false, true);
        await buf.setLines(lines, { start: 0, end: -1, strictIndexing: false });
        await buf.setOption("modifiable", false);
        await buf.setOption("buftype", "nofile");
        await buf.setOption("bufhidden", "wipe");
        await buf.setOption("filetype", "nostr-notes");
        const width = await plugin.nvim.getOption("columns");
        const height = await plugin.nvim.getOption("lines");
        const winWidth = Math.floor(width * 0.8);
        const winHeight = Math.floor(height * 0.8);
        const row = Math.floor((height - winHeight) / 2);
        const col = Math.floor((width - winWidth) / 2);
        const win = await plugin.nvim.openWindow(buf, true, {
          relative: "editor",
          width: winWidth,
          height: winHeight,
          row,
          col,
          style: "minimal",
          border: "rounded"
        });
        await win.setOption("wrap", true);
        await win.setOption("cursorline", true);
        await plugin.nvim.command(
          `autocmd BufLeave <buffer=${buf.id}> ++once lua vim.api.nvim_win_close(${win.id}, true)`
        );
        await buf.setKeymap("n", "q", ":close<CR>", {
          noremap: true,
          silent: true
        });
      } catch (error) {
        await plugin.nvim.errWrite(`Error getting notes: ${error}
`);
      }
    },
    { sync: false, nargs: "*" }
  );
}
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
