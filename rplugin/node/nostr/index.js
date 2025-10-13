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
function migrateRelayConfig(config) {
  if (!config.relays || config.relays.length === 0) {
    return config;
  }
  if (typeof config.relays[0] === "object" && "url" in config.relays[0]) {
    return config;
  }
  const migratedRelays = config.relays.map(
    (url) => ({
      url,
      read: true,
      write: true
    })
  );
  return {
    ...config,
    relays: migratedRelays
  };
}
function getReadRelays(config) {
  if (!config.relays || config.relays.length === 0) {
    return [];
  }
  if (typeof config.relays[0] === "string") {
    return config.relays;
  }
  return config.relays.filter((r) => r.read).map((r) => r.url);
}
function getWriteRelays(config) {
  if (!config.relays || config.relays.length === 0) {
    return [];
  }
  if (typeof config.relays[0] === "string") {
    return config.relays;
  }
  return config.relays.filter((r) => r.write).map((r) => r.url);
}
async function loadConfig() {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return {};
    }
    const data = await readFile(CONFIG_FILE, "utf-8");
    const config = JSON.parse(data);
    return migrateRelayConfig(config);
  } catch (error) {
    console.error(`Failed to load config: ${error}`);
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
        const defaultRelays = [
          { url: "wss://relay.damus.io", read: true, write: true },
          { url: "wss://relay.notebin.io", read: true, write: true }
        ];
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
` + defaultRelays.map((r) => `  - ${r.url}`).join("\n") + `

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
        const defaultRelays = [
          { url: "wss://relay.damus.io", read: true, write: true },
          { url: "wss://relay.notebin.io", read: true, write: true }
        ];
        config.relays = defaultRelays;
        await saveConfig(config);
        await plugin.nvim.outWrite(
          `Default relay configured!

Relays:
` + defaultRelays.map((r) => `  - ${r.url}`).join("\n") + `

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
        const writeRelays = getWriteRelays(config);
        if (writeRelays.length === 0) {
          await plugin.nvim.errWrite(
            "No write relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
          );
          return;
        }
        const { parseRecipient, sendMessage } = await import("./message-VLX55HFO.js");
        const recipientInput = args[0];
        const message = args.slice(1).join(" ");
        const recipientPubkey = parseRecipient(recipientInput);
        await plugin.nvim.outWrite("Sending encrypted message...\n");
        await sendMessage(
          config.privateKey,
          recipientPubkey,
          message,
          writeRelays
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
        const readRelays = getReadRelays(config);
        if (readRelays.length === 0) {
          await plugin.nvim.errWrite(
            "No read relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
          );
          return;
        }
        const { receiveMessages, formatTimestamp } = await import("./message-VLX55HFO.js");
        const { npubEncode } = await import("nostr-tools/nip19");
        await plugin.nvim.outWrite("Fetching messages from relays...\n");
        const messages = await receiveMessages(
          config.privateKey,
          readRelays,
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
        const writeRelays = getWriteRelays(config);
        if (writeRelays.length === 0) {
          await plugin.nvim.errWrite(
            "No write relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
          );
          return;
        }
        const { postNote } = await import("./note-PD4T42XH.js");
        const content = args.join(" ");
        await plugin.nvim.outWrite("Publishing note to Nostr...\n");
        const eventId = await postNote(config.privateKey, content, writeRelays);
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
        const writeRelays = getWriteRelays(config);
        if (writeRelays.length === 0) {
          await plugin.nvim.errWrite(
            "No write relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
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
        const { postNote } = await import("./note-PD4T42XH.js");
        await plugin.nvim.outWrite("\nPublishing note to Nostr...\n");
        const eventId = await postNote(config.privateKey, content, writeRelays);
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
        const writeRelays = getWriteRelays(config);
        if (writeRelays.length === 0) {
          await plugin.nvim.errWrite(
            "No write relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
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
        const { postSnippet, getFileExtension, detectLanguageFromExtension } = await import("./snippet-QYGUAR2H.js");
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
        const tagsInput = await plugin.nvim.call("input", [
          "Tags (comma-separated, optional): "
        ]);
        let tags;
        if (tagsInput && tagsInput.trim() !== "") {
          tags = tagsInput.split(",").map((t) => t.trim());
        }
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
        if (tags && tags.length > 0)
          confirmMsg += `Tags: ${tags.join(", ")}
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
            description: description || void 0,
            tags
          },
          writeRelays
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
    "NostrPostLongform",
    async () => {
      try {
        const config = await loadConfig();
        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            "No keys found. Run :NostrInit or :NostrGenerateKeys first.\n"
          );
          return;
        }
        const writeRelays = getWriteRelays(config);
        if (writeRelays.length === 0) {
          await plugin.nvim.errWrite(
            "No write relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
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
        const {
          postLongform,
          extractFrontmatter,
          extractTitleFromMarkdown,
          generateIdentifier
        } = await import("./longform-KREQI744.js");
        const { frontmatter, markdown: markdownWithPossibleTitle } = extractFrontmatter(content);
        const { title: markdownTitle, content: markdownContent } = extractTitleFromMarkdown(markdownWithPossibleTitle);
        let title = frontmatter.title;
        if (!title && markdownTitle) {
          title = markdownTitle;
        }
        if (!title) {
          title = await plugin.nvim.call("input", [
            "Article title: "
          ]);
          if (!title || title.trim() === "") {
            await plugin.nvim.errWrite(
              "Title is required for long-form content.\n"
            );
            return;
          }
        }
        const finalMarkdown = markdownTitle ? markdownContent : markdownWithPossibleTitle;
        let summary = frontmatter.summary;
        if (!summary) {
          summary = await plugin.nvim.call("input", [
            "Summary (optional): "
          ]);
        }
        let topics = frontmatter.tags || frontmatter.topics;
        if (!topics) {
          const topicsInput = await plugin.nvim.call("input", [
            "Topics (comma-separated, optional): "
          ]);
          if (topicsInput && topicsInput.trim() !== "") {
            topics = topicsInput.split(",").map((t) => t.trim());
          }
        }
        const identifier = frontmatter.identifier || frontmatter.id || generateIdentifier(title);
        const image = frontmatter.image;
        let confirmMsg = `Post long-form article to Nostr (NIP-23)?
`;
        confirmMsg += `Title: ${title}
`;
        if (summary) confirmMsg += `Summary: ${summary}
`;
        if (image) confirmMsg += `Image: ${image}
`;
        if (topics && topics.length > 0)
          confirmMsg += `Topics: ${topics.join(", ")}
`;
        confirmMsg += `Identifier: ${identifier}
`;
        confirmMsg += `Words: ${finalMarkdown.split(/\s+/).length}
`;
        confirmMsg += `Confirm (y/n): `;
        const confirmation = await plugin.nvim.call("input", [confirmMsg]);
        if (confirmation !== "y" && confirmation !== "Y") {
          await plugin.nvim.outWrite("Post cancelled.\n");
          return;
        }
        await plugin.nvim.outWrite(
          "\nPublishing long-form article to Nostr...\n"
        );
        const eventId = await postLongform(
          config.privateKey,
          finalMarkdown,
          {
            identifier,
            title,
            summary: summary || void 0,
            image,
            topics
          },
          writeRelays
        );
        await plugin.nvim.outWrite(
          `Article published successfully!
Event ID: ${eventId}
`
        );
        const bufferName = await buffer.name;
        if (bufferName) {
          const needsUpdate = Object.keys(frontmatter).length === 0 || !frontmatter.identifier || frontmatter.identifier !== identifier;
          if (needsUpdate) {
            const currentLines = await buffer.lines;
            const currentContent = currentLines.join("\n");
            const { frontmatter: currentFm, markdown: currentMd } = extractFrontmatter(currentContent);
            let newContent;
            if (Object.keys(currentFm).length > 0) {
              const fmLines = ["---"];
              if (identifier) {
                fmLines.push(`identifier: ${identifier}`);
              }
              for (const [key, value] of Object.entries(currentFm)) {
                if (key === "identifier") continue;
                if (Array.isArray(value)) {
                  fmLines.push(`${key}: ${value.join(", ")}`);
                } else {
                  fmLines.push(`${key}: ${value}`);
                }
              }
              fmLines.push("---", "");
              newContent = fmLines.join("\n") + currentMd;
            } else {
              const fmLines = [
                "---",
                `identifier: ${identifier}`,
                `title: ${title}`,
                "---",
                ""
              ];
              newContent = fmLines.join("\n") + currentContent;
            }
            const newLines = newContent.split("\n");
            await buffer.setLines(newLines, {
              start: 0,
              end: -1,
              strictIndexing: false
            });
            await plugin.nvim.command("write");
            await plugin.nvim.outWrite(
              "Frontmatter updated with identifier and file saved.\n"
            );
          }
        }
      } catch (error) {
        await plugin.nvim.errWrite(`Error posting article: ${error}
`);
      }
    },
    { sync: false }
  );
  plugin.registerCommand(
    "NostrAddFrontmatter",
    async () => {
      try {
        const buffer = await plugin.nvim.buffer;
        const lines = await buffer.lines;
        const content = lines.join("\n");
        if (content.trim() === "") {
          await plugin.nvim.errWrite("Buffer is empty.\n");
          return;
        }
        const { extractFrontmatter, extractTitleFromMarkdown } = await import("./longform-KREQI744.js");
        const { frontmatter } = extractFrontmatter(content);
        if (Object.keys(frontmatter).length > 0) {
          await plugin.nvim.errWrite(
            "Buffer already has frontmatter. Remove it first if you want to recreate it.\n"
          );
          return;
        }
        const { title: markdownTitle } = extractTitleFromMarkdown(content);
        const title = await plugin.nvim.call("input", [
          `Title${markdownTitle ? ` [${markdownTitle}]` : ""}: `
        ]);
        const finalTitle = title.trim() || markdownTitle;
        if (!finalTitle) {
          await plugin.nvim.errWrite("Title is required.\n");
          return;
        }
        const identifier = await plugin.nvim.call("input", [
          "Identifier (optional, auto-generated if empty): "
        ]);
        const summary = await plugin.nvim.call("input", [
          "Summary (optional): "
        ]);
        const image = await plugin.nvim.call("input", [
          "Image URL (optional): "
        ]);
        const topicsInput = await plugin.nvim.call("input", [
          "Topics/tags (comma-separated, optional): "
        ]);
        const frontmatterLines = ["---", `title: ${finalTitle}`];
        if (identifier && identifier.trim() !== "") {
          frontmatterLines.push(`identifier: ${identifier.trim()}`);
        }
        if (summary && summary.trim() !== "") {
          frontmatterLines.push(`summary: ${summary.trim()}`);
        }
        if (image && image.trim() !== "") {
          frontmatterLines.push(`image: ${image.trim()}`);
        }
        if (topicsInput && topicsInput.trim() !== "") {
          const topics = topicsInput.split(",").map((t) => t.trim());
          frontmatterLines.push(`tags: ${topics.join(", ")}`);
        }
        frontmatterLines.push("---", "");
        await buffer.setLines(frontmatterLines, {
          start: 0,
          end: 0,
          strictIndexing: false
        });
        await plugin.nvim.outWrite("Frontmatter added successfully!\n");
      } catch (error) {
        await plugin.nvim.errWrite(`Error adding frontmatter: ${error}
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
        const readRelays = getReadRelays(config);
        if (readRelays.length === 0) {
          await plugin.nvim.errWrite(
            "No read relays configured. Run :NostrInit or :NostrSetupRelay first.\n"
          );
          return;
        }
        const { getNotesForPubkey, parsePubkey, formatTimestamp } = await import("./note-PD4T42XH.js");
        const { npubEncode } = await import("nostr-tools/nip19");
        const pubkeyInput = args[0];
        const pubkey = parsePubkey(pubkeyInput);
        await plugin.nvim.outWrite("Fetching notes from relays...\n");
        const notes = await getNotesForPubkey(pubkey, readRelays, 20);
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
