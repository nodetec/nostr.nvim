import { NvimPlugin } from 'neovim';
import { generateKeys, importNsec } from './lib/keys.js';
import { loadConfig, saveConfig } from './lib/config.js';

export default function (plugin: NvimPlugin) {
  plugin.registerCommand(
    'NostrInit',
    async () => {
      try {
        const keys = generateKeys();
        const defaultRelays = ['wss://relay.damus.io'];

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
            defaultRelays.map(r => `  - ${r}`).join('\n') +
            `\n\nConfiguration saved to ~/.config/nostr.nvim/config.json\n`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error initializing config: ${error}\n`);
      }
    },
    { sync: false }
  );

  plugin.registerCommand(
    'NostrGenerateKeys',
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
            `Keep your nsec private: ${keys.nsec}\n`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error generating keys: ${error}\n`);
      }
    },
    { sync: false }
  );

  plugin.registerCommand(
    'NostrImportKey',
    async (args: string[]) => {
      try {
        if (args.length === 0) {
          await plugin.nvim.errWrite(
            'Usage: :NostrImportKey <nsec>\n' +
              'Example: :NostrImportKey nsec1...\n'
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
            `Your keys have been saved to ~/.config/nostr.nvim/config.json\n`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error importing key: ${error}\n`);
      }
    },
    { sync: false, nargs: '*' }
  );

  plugin.registerCommand(
    'NostrShowPubkey',
    async () => {
      try {
        const config = await loadConfig();

        if (!config.publicKey) {
          await plugin.nvim.outWrite(
            'No keys found. Generate keys with :NostrGenerateKeys or import with :NostrImportKey\n'
          );
          return;
        }

        const { getKeysFromHex } = await import('./lib/keys.js');
        const keys = getKeysFromHex(config.publicKey);

        await plugin.nvim.outWrite(
          `Your public key (npub): ${keys.npub}\n` +
            `Hex: ${keys.publicKey}\n`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error showing pubkey: ${error}\n`);
      }
    },
    { sync: false }
  );

  plugin.registerCommand(
    'NostrGetNpub',
    async () => {
      try {
        const config = await loadConfig();

        if (!config.publicKey) {
          await plugin.nvim.errWrite(
            'No keys found. Generate keys with :NostrGenerateKeys or import with :NostrImportKey\n'
          );
          return;
        }

        const { getKeysFromHex } = await import('./lib/keys.js');
        const keys = getKeysFromHex(config.publicKey);

        await plugin.nvim.outWrite(`${keys.npub}\n`);
      } catch (error) {
        await plugin.nvim.errWrite(`Error getting npub: ${error}\n`);
      }
    },
    { sync: false }
  );

  plugin.registerCommand(
    'NostrSetupRelay',
    async () => {
      try {
        const config = await loadConfig();

        const defaultRelays = ['wss://relay.damus.io'];
        config.relays = defaultRelays;
        await saveConfig(config);

        await plugin.nvim.outWrite(
          `Default relay configured!\n\n` +
            `Relays:\n` +
            defaultRelays.map(r => `  - ${r}`).join('\n') +
            `\n\nRelay configuration saved to ~/.config/nostr.nvim/config.json\n`
        );
      } catch (error) {
        await plugin.nvim.errWrite(`Error setting up relay: ${error}\n`);
      }
    },
    { sync: false }
  );

  plugin.registerCommand(
    'NostrSendDM',
    async (args: string[]) => {
      try {
        if (args.length < 2) {
          await plugin.nvim.errWrite(
            'Usage: :NostrSendDM <npub/hex> <message>\n' +
              'Example: :NostrSendDM npub1... Hello from Neovim!\n'
          );
          return;
        }

        const config = await loadConfig();

        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            'No keys found. Run :NostrInit or :NostrGenerateKeys first.\n'
          );
          return;
        }

        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            'No relays configured. Run :NostrInit or :NostrSetupRelay first.\n'
          );
          return;
        }

        const { parseRecipient, sendMessage } = await import('./lib/message.js');
        const recipientInput = args[0];
        const message = args.slice(1).join(' ');

        const recipientPubkey = parseRecipient(recipientInput);

        await plugin.nvim.outWrite('Sending encrypted message...\n');

        await sendMessage(
          config.privateKey,
          recipientPubkey,
          message,
          config.relays
        );

        await plugin.nvim.outWrite('Message sent successfully!\n');
      } catch (error) {
        await plugin.nvim.errWrite(`Error sending message: ${error}\n`);
      }
    },
    { sync: false, nargs: '*' }
  );

  plugin.registerCommand(
    'NostrCheckDMs',
    async () => {
      try {
        const config = await loadConfig();

        if (!config.privateKey) {
          await plugin.nvim.errWrite(
            'No keys found. Run :NostrInit or :NostrGenerateKeys first.\n'
          );
          return;
        }

        if (!config.relays || config.relays.length === 0) {
          await plugin.nvim.errWrite(
            'No relays configured. Run :NostrInit or :NostrSetupRelay first.\n'
          );
          return;
        }

        const { receiveMessages, formatTimestamp } = await import('./lib/message.js');
        const { npubEncode } = await import('nostr-tools/nip19');

        await plugin.nvim.outWrite('Fetching messages from relays...\n\n');

        const messages = await receiveMessages(
          config.privateKey,
          config.relays,
          20
        );

        if (messages.length === 0) {
          await plugin.nvim.outWrite('No messages found.\n');
          return;
        }

        await plugin.nvim.outWrite(`Found ${messages.length} message(s):\n\n`);

        for (const msg of messages) {
          const fromNpub = npubEncode(msg.from);
          const timestamp = formatTimestamp(msg.created_at);

          await plugin.nvim.outWrite(
            `From: ${fromNpub}\n` +
              `Time: ${timestamp}\n` +
              `Message: ${msg.content}\n` +
              `${'='.repeat(60)}\n\n`
          );
        }
      } catch (error) {
        await plugin.nvim.errWrite(`Error checking messages: ${error}\n`);
      }
    },
    { sync: false }
  );
}
