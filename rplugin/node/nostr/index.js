import {
  generateKeys,
  importNsec
} from "./chunk-BOPSCFDL.js";
import "./chunk-SLYNB64A.js";

// src/lib/config.ts
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
var CONFIG_DIR = join(homedir(), ".config", "nostr.nvim");
var CONFIG_FILE = join(CONFIG_DIR, "config.json");
async function loadConfig() {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return {};
    }
    const data = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}
async function saveConfig(config) {
  try {
    if (!existsSync(CONFIG_DIR)) {
      await mkdir(CONFIG_DIR, { recursive: true });
    }
    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
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
        const { getKeysFromHex } = await import("./keys-7HQP2EMA.js");
        const keys = getKeysFromHex(config.publicKey);
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
        const { npubEncode } = await import("nostr-tools/nip19");
        const npub = npubEncode(config.publicKey);
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
        const { parseRecipient, sendMessage } = await import("./message-XZ5XYPE2.js");
        const recipientInput = args[0];
        const message = args.slice(1).join(" ");
        const recipientPubkey = parseRecipient(recipientInput);
        await plugin.nvim.outWrite("Sending encrypted message...\n");
        await sendMessage(
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
        const { receiveMessages, formatTimestamp } = await import("./message-XZ5XYPE2.js");
        const { npubEncode } = await import("nostr-tools/nip19");
        await plugin.nvim.outWrite("Fetching messages from relays...\n");
        const messages = await receiveMessages(
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
          const fromNpub = npubEncode(msg.from);
          const timestamp = formatTimestamp(msg.created_at);
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
        const bufResult = await plugin.nvim.createBuffer(false, true);
        if (typeof bufResult === "number") {
          throw new Error("Failed to create buffer");
        }
        const buf = bufResult;
        const bufnr = buf.id;
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
        const winResult = await plugin.nvim.openWindow(buf, true, {
          relative: "editor",
          width: winWidth,
          height: winHeight,
          row,
          col,
          style: "minimal",
          border: "rounded"
        });
        if (typeof winResult === "number") {
          throw new Error("Failed to open window");
        }
        const win = winResult;
        await win.setOption("wrap", true);
        await win.setOption("cursorline", true);
        await plugin.nvim.command(
          `autocmd BufLeave <buffer=${bufnr}> ++once lua vim.api.nvim_win_close(${win.id}, true)`
        );
        await plugin.nvim.call("nvim_buf_set_keymap", [
          bufnr,
          "n",
          "q",
          ":close<CR>",
          { noremap: true, silent: true }
        ]);
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
        const { postNote } = await import("./note-4MVTJQXZ.js");
        const content = args.join(" ");
        await plugin.nvim.outWrite("Publishing note to Nostr...\n");
        const eventId = await postNote(
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
    "NostrPostBuffer",
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
        const buffer = await plugin.nvim.buffer;
        const lines = await buffer.lines;
        const content = lines.join("\n");
        if (content.trim() === "") {
          await plugin.nvim.errWrite("Buffer is empty. Nothing to post.\n");
          return;
        }
        const confirmation = await plugin.nvim.call("input", [
          `Post this note to Nostr? (y/n): `
        ]);
        if (confirmation !== "y" && confirmation !== "Y") {
          await plugin.nvim.outWrite("Post cancelled.\n");
          return;
        }
        const { postNote } = await import("./note-4MVTJQXZ.js");
        await plugin.nvim.outWrite("\nPublishing note to Nostr...\n");
        const eventId = await postNote(
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
        await plugin.nvim.errWrite(`Error posting buffer: ${error}
`);
      }
    },
    { sync: false }
  );
  plugin.registerCommand(
    "NostrPostSnippet",
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
        const buffer = await plugin.nvim.buffer;
        const lines = await buffer.lines;
        const content = lines.join("\n");
        if (content.trim() === "") {
          await plugin.nvim.errWrite("Buffer is empty. Nothing to post.\n");
          return;
        }
        const bufferName = await buffer.name;
        const filetype = await plugin.nvim.call("getbufvar", [
          buffer.id,
          "&filetype"
        ]);
        const {
          postSnippet,
          getFileExtension,
          detectLanguageFromExtension
        } = await import("./snippet-5RGWI2IP.js");
        let language = filetype || void 0;
        let extension;
        let name;
        if (bufferName) {
          const filename = bufferName.split("/").pop() || bufferName;
          name = filename;
          extension = getFileExtension(filename);
          if (extension && !language) {
            language = detectLanguageFromExtension(extension);
          }
        }
        const description = await plugin.nvim.call("input", [
          "Description (optional): "
        ]);
        let confirmMsg = `Post code snippet to Nostr (NIP-C0)?
`;
        if (name) confirmMsg += `Name: ${name}
`;
        if (language) confirmMsg += `Language: ${language}
`;
        if (extension) confirmMsg += `Extension: ${extension}
`;
        if (description) confirmMsg += `Description: ${description}
`;
        confirmMsg += `Lines: ${lines.length}
`;
        confirmMsg += `Confirm (y/n): `;
        const confirmation = await plugin.nvim.call("input", [confirmMsg]);
        if (confirmation !== "y" && confirmation !== "Y") {
          await plugin.nvim.outWrite("Post cancelled.\n");
          return;
        }
        await plugin.nvim.outWrite("\nPublishing code snippet to Nostr...\n");
        const eventId = await postSnippet(
          config.privateKey,
          content,
          {
            language,
            name,
            extension,
            description: description || void 0
          },
          config.relays
        );
        await plugin.nvim.outWrite(
          `Code snippet published successfully!
Event ID: ${eventId}
`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error posting snippet: ${error}
`);
      }
    },
    { sync: false }
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
        const { getNotesForPubkey, parsePubkey, formatTimestamp } = await import("./note-4MVTJQXZ.js");
        const { npubEncode } = await import("nostr-tools/nip19");
        const pubkeyInput = args[0];
        const pubkey = parsePubkey(pubkeyInput);
        await plugin.nvim.outWrite("Fetching notes from relays...\n");
        const notes = await getNotesForPubkey(pubkey, config.relays, 20);
        if (notes.length === 0) {
          await plugin.nvim.outWrite("No notes found for this user.\n");
          return;
        }
        const npub = npubEncode(pubkey);
        const lines = [
          `Notes from ${npub}`,
          "=".repeat(80),
          `${notes.length} note${notes.length > 1 ? "s" : ""}`,
          ""
        ];
        for (const note of notes) {
          const timestamp = formatTimestamp(note.created_at);
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
        const bufResult = await plugin.nvim.createBuffer(false, true);
        if (typeof bufResult === "number") {
          throw new Error("Failed to create buffer");
        }
        const buf = bufResult;
        const bufnr = buf.id;
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
        const winResult = await plugin.nvim.openWindow(buf, true, {
          relative: "editor",
          width: winWidth,
          height: winHeight,
          row,
          col,
          style: "minimal",
          border: "rounded"
        });
        if (typeof winResult === "number") {
          throw new Error("Failed to open window");
        }
        const win = winResult;
        await win.setOption("wrap", true);
        await win.setOption("cursorline", true);
        await plugin.nvim.command(
          `autocmd BufLeave <buffer=${bufnr}> ++once lua vim.api.nvim_win_close(${win.id}, true)`
        );
        await plugin.nvim.call("nvim_buf_set_keymap", [
          bufnr,
          "n",
          "q",
          ":close<CR>",
          { noremap: true, silent: true }
        ]);
      } catch (error) {
        await plugin.nvim.errWrite(`Error getting notes: ${error}
`);
      }
    },
    { sync: false, nargs: "*" }
  );
}
export {
  index_default as default
};
