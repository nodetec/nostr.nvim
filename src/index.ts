import { NvimPlugin } from "neovim";
import { generateKeys, importNsec } from "./lib/keys.js";
import { loadConfig, saveConfig } from "./lib/config.js";

export default function (plugin: NvimPlugin) {
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
          `Nostr configuration initialized!\n\n` +
            `Public Key (npub): ${keys.npub}\n` +
            `Keep your nsec private: ${keys.nsec}\n\n` +
            `Relays:\n` +
            defaultRelays.map((r) => `  - ${r}`).join("\n") +
            `\n\nConfiguration saved to ~/.config/nostr.nvim/config.json\n`,
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error initializing config: ${error}\n`);
      }
    },
    { sync: false },
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
          `Keys generated successfully!\n\nPublic Key (npub): ${keys.npub}\n\n` +
            `Your keys have been saved to ~/.config/nostr.nvim/config.json\n` +
            `Keep your nsec private: ${keys.nsec}\n`,
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error generating keys: ${error}\n`);
      }
    },
    { sync: false },
  );

  plugin.registerCommand(
    "NostrImportKey",
    async (args: string[]) => {
      try {
        if (args.length === 0) {
          await plugin.nvim.errWrite(
            "Usage: :NostrImportKey <nsec>\n" +
              "Example: :NostrImportKey nsec1...\n",
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
          `Keys imported successfully!\n\nPublic Key (npub): ${keys.npub}\n\n` +
            `Your keys have been saved to ~/.config/nostr.nvim/config.json\n`,
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error importing key: ${error}\n`);
      }
    },
    { sync: false, nargs: "*" },
  );

  plugin.registerCommand(
    "NostrShowPubkey",
    async () => {
      try {
        const config = await loadConfig();

        if (!config.publicKey) {
          await plugin.nvim.outWrite(
            "No keys found. Generate keys with :NostrGenerateKeys or import with :NostrImportKey\n",
          );
          return;
        }

        const { getKeysFromHex } = await import("./lib/keys.js");
        const keys = getKeysFromHex(config.publicKey);

        await plugin.nvim.outWrite(
          `Your public key (npub): ${keys.npub}\n` + `Hex: ${keys.publicKey}\n`,
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error showing pubkey: ${error}\n`);
      }
    },
    { sync: false },
  );

  plugin.registerCommand(
    "NostrGetNpub",
    async () => {
      try {
        const config = await loadConfig();

        if (!config.publicKey) {
          await plugin.nvim.errWrite(
            "No keys found. Generate keys with :NostrGenerateKeys or import with :NostrImportKey\n",
          );
          return;
        }

        const { npubEncode } = await import("nostr-tools/nip19");
        const npub = npubEncode(config.publicKey);

        // Copy to system clipboard
        await plugin.nvim.call("setreg", ["+", npub]);

        await plugin.nvim.outWrite(`${npub}\n(Copied to clipboard)\n`);
      } catch (error) {
        await plugin.nvim.errWrite(`Error getting npub: ${error}\n`);
      }
    },
    { sync: false },
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
          `Default relay configured!\n\n` +
            `Relays:\n` +
            defaultRelays.map((r) => `  - ${r}`).join("\n") +
            `\n\nRelay configuration saved to ~/.config/nostr.nvim/config.json\n`,
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error setting up relay: ${error}\n`);
      }
    },
    { sync: false },
  );

  plugin.registerCommand(
    "NostrSendDM",
    async (args: string[]) => {
      try {
        if (args.length < 2) {
          await plugin.nvim.errWrite(
            "Usage: :NostrSendDM <npub/hex> <message>\n" +
              "Example: :NostrSendDM npub1... Hello from Neovim!\n",
          );
          return;
        }

        const config = await loadConfig();

        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            "No keys found. Run :NostrInit or :NostrGenerateKeys first.\n",
          );
          return;
        }

        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            "No relays configured. Run :NostrInit or :NostrSetupRelay first.\n",
          );
          return;
        }

        const { parseRecipient, sendMessage } = await import(
          "./lib/message.js"
        );
        const recipientInput = args[0];
        const message = args.slice(1).join(" ");

        const recipientPubkey = parseRecipient(recipientInput);

        await plugin.nvim.outWrite("Sending encrypted message...\n");

        await sendMessage(
          config.privateKey,
          recipientPubkey,
          message,
          config.relays,
        );

        await plugin.nvim.outWrite("Message sent successfully!\n");
      } catch (error) {
        await plugin.nvim.errWrite(`Error sending message: ${error}\n`);
      }
    },
    { sync: false, nargs: "*" },
  );

  plugin.registerCommand(
    "NostrCheckDMs",
    async () => {
      try {
        const config = await loadConfig();

        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            "No keys found. Run :NostrInit or :NostrGenerateKeys first.\n",
          );
          return;
        }

        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            "No relays configured. Run :NostrInit or :NostrSetupRelay first.\n",
          );
          return;
        }

        const { receiveMessages, formatTimestamp } = await import(
          "./lib/message.js"
        );
        const { npubEncode } = await import("nostr-tools/nip19");

        await plugin.nvim.outWrite("Fetching messages from relays...\n");

        const messages = await receiveMessages(
          config.privateKey,
          config.relays,
          20,
        );

        if (messages.length === 0) {
          await plugin.nvim.outWrite("No messages found.\n");
          return;
        }

        // Format messages into buffer lines
        const lines: string[] = [
          `Nostr Direct Messages (${messages.length} message${messages.length > 1 ? "s" : ""})`,
          "=".repeat(80),
          "",
        ];

        for (const msg of messages) {
          const fromNpub = npubEncode(msg.from);
          const timestamp = formatTimestamp(msg.created_at);

          lines.push(`From: ${fromNpub}`);
          lines.push(`Time: ${timestamp}`);
          lines.push("");

          // Split content by newlines to avoid multi-line strings
          const contentLines = msg.content.split("\n");
          lines.push(...contentLines);

          lines.push("");
          lines.push("-".repeat(80));
          lines.push("");
        }

        lines.push("");
        lines.push("Press q to close");

        // Create a new buffer
        const bufResult = await plugin.nvim.createBuffer(false, true);
        if (typeof bufResult === 'number') {
          throw new Error('Failed to create buffer');
        }
        const buf = bufResult;
        const bufnr = buf.id;

        await buf.setLines(lines, { start: 0, end: -1, strictIndexing: false });
        await buf.setOption("modifiable", false);
        await buf.setOption("buftype", "nofile");
        await buf.setOption("bufhidden", "wipe");
        await buf.setOption("filetype", "nostr-messages");

        // Get editor dimensions
        const width = (await plugin.nvim.getOption("columns")) as number;
        const height = (await plugin.nvim.getOption("lines")) as number;

        // Calculate popup size (80% of screen)
        const winWidth = Math.floor(width * 0.8);
        const winHeight = Math.floor(height * 0.8);

        // Calculate centering position
        const row = Math.floor((height - winHeight) / 2);
        const col = Math.floor((width - winWidth) / 2);

        // Open floating window
        const winResult = await plugin.nvim.openWindow(buf, true, {
          relative: "editor",
          width: winWidth,
          height: winHeight,
          row,
          col,
          style: "minimal",
          border: "rounded",
        });

        if (typeof winResult === 'number') {
          throw new Error('Failed to open window');
        }
        const win = winResult;

        // Set window options
        await win.setOption("wrap", true);
        await win.setOption("cursorline", true);

        // Map 'q' to close the window
        await plugin.nvim.command(
          `autocmd BufLeave <buffer=${bufnr}> ++once lua vim.api.nvim_win_close(${win.id}, true)`,
        );
        await plugin.nvim.call("nvim_buf_set_keymap", [
          bufnr,
          "n",
          "q",
          ":close<CR>",
          { noremap: true, silent: true },
        ]);
      } catch (error) {
        await plugin.nvim.errWrite(`Error checking messages: ${error}\n`);
      }
    },
    { sync: false },
  );

  plugin.registerCommand(
    "NostrPostNote",
    async (args: string[]) => {
      try {
        if (args.length === 0) {
          await plugin.nvim.errWrite(
            "Usage: :NostrPostNote <message>\n" +
              "Example: :NostrPostNote Hello Nostr from Neovim!\n",
          );
          return;
        }

        const config = await loadConfig();

        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            "No keys found. Run :NostrInit or :NostrGenerateKeys first.\n",
          );
          return;
        }

        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            "No relays configured. Run :NostrInit or :NostrSetupRelay first.\n",
          );
          return;
        }

        const { postNote } = await import("./lib/note.js");
        const content = args.join(" ");

        await plugin.nvim.outWrite("Publishing note to Nostr...\n");

        const eventId = await postNote(
          config.privateKey,
          content,
          config.relays,
        );

        await plugin.nvim.outWrite(
          `Note published successfully!\n` + `Event ID: ${eventId}\n`,
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error posting note: ${error}\n`);
      }
    },
    { sync: false, nargs: "*" },
  );

  plugin.registerCommand(
    "NostrPostBuffer",
    async () => {
      try {
        const config = await loadConfig();

        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            "No keys found. Run :NostrInit or :NostrGenerateKeys first.\n",
          );
          return;
        }

        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            "No relays configured. Run :NostrInit or :NostrSetupRelay first.\n",
          );
          return;
        }

        // Get current buffer content
        const buffer = await plugin.nvim.buffer;
        const lines = await buffer.lines;
        const content = lines.join("\n");

        if (content.trim() === "") {
          await plugin.nvim.errWrite("Buffer is empty. Nothing to post.\n");
          return;
        }

        // Show confirmation prompt
        const confirmation = await plugin.nvim.call("input", [
          `Post this note to Nostr? (y/n): `,
        ]);

        if (confirmation !== "y" && confirmation !== "Y") {
          await plugin.nvim.outWrite("Post cancelled.\n");
          return;
        }

        const { postNote } = await import("./lib/note.js");

        await plugin.nvim.outWrite("\nPublishing note to Nostr...\n");

        const eventId = await postNote(
          config.privateKey,
          content,
          config.relays,
        );

        await plugin.nvim.outWrite(
          `Note published successfully!\n` + `Event ID: ${eventId}\n`,
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error posting buffer: ${error}\n`);
      }
    },
    { sync: false },
  );

  plugin.registerCommand(
    "NostrGetNotes",
    async (args: string[]) => {
      try {
        if (args.length === 0) {
          await plugin.nvim.errWrite(
            "Usage: :NostrGetNotes <npub/hex>\n" +
              "Example: :NostrGetNotes npub1...\n",
          );
          return;
        }

        const config = await loadConfig();

        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            "No relays configured. Run :NostrInit or :NostrSetupRelay first.\n",
          );
          return;
        }

        const { getNotesForPubkey, parsePubkey, formatTimestamp } =
          await import("./lib/note.js");
        const { npubEncode } = await import("nostr-tools/nip19");

        const pubkeyInput = args[0];
        const pubkey = parsePubkey(pubkeyInput);

        await plugin.nvim.outWrite("Fetching notes from relays...\n");

        const notes = await getNotesForPubkey(pubkey, config.relays, 20);

        if (notes.length === 0) {
          await plugin.nvim.outWrite("No notes found for this user.\n");
          return;
        }

        // Format notes into buffer lines
        const npub = npubEncode(pubkey);
        const lines: string[] = [
          `Notes from ${npub}`,
          "=".repeat(80),
          `${notes.length} note${notes.length > 1 ? "s" : ""}`,
          "",
        ];

        for (const note of notes) {
          const timestamp = formatTimestamp(note.created_at);

          lines.push(`Posted: ${timestamp}`);
          lines.push("");

          // Split content by newlines to avoid multi-line strings
          const contentLines = note.content.split("\n");
          lines.push(...contentLines);

          lines.push("");
          lines.push("-".repeat(80));
          lines.push("");
        }

        lines.push("");
        lines.push("Press q to close");

        // Create a new buffer
        const bufResult = await plugin.nvim.createBuffer(false, true);
        if (typeof bufResult === 'number') {
          throw new Error('Failed to create buffer');
        }
        const buf = bufResult;
        const bufnr = buf.id;
        await buf.setLines(lines, { start: 0, end: -1, strictIndexing: false });
        await buf.setOption("modifiable", false);
        await buf.setOption("buftype", "nofile");
        await buf.setOption("bufhidden", "wipe");
        await buf.setOption("filetype", "nostr-notes");

        // Get editor dimensions
        const width = (await plugin.nvim.getOption("columns")) as number;
        const height = (await plugin.nvim.getOption("lines")) as number;

        // Calculate popup size (80% of screen)
        const winWidth = Math.floor(width * 0.8);
        const winHeight = Math.floor(height * 0.8);

        // Calculate centering position
        const row = Math.floor((height - winHeight) / 2);
        const col = Math.floor((width - winWidth) / 2);

        // Open floating window
        const winResult = await plugin.nvim.openWindow(buf, true, {
          relative: "editor",
          width: winWidth,
          height: winHeight,
          row,
          col,
          style: "minimal",
          border: "rounded",
        });

        if (typeof winResult === 'number') {
          throw new Error('Failed to open window');
        }
        const win = winResult;

        // Set window options
        await win.setOption("wrap", true);
        await win.setOption("cursorline", true);

        // Map 'q' to close the window
        await plugin.nvim.command(
          `autocmd BufLeave <buffer=${bufnr}> ++once lua vim.api.nvim_win_close(${win.id}, true)`,
        );
        await plugin.nvim.call("nvim_buf_set_keymap", [
          bufnr,
          "n",
          "q",
          ":close<CR>",
          { noremap: true, silent: true },
        ]);
      } catch (error) {
        await plugin.nvim.errWrite(`Error getting notes: ${error}\n`);
      }
    },
    { sync: false, nargs: "*" },
  );
}
