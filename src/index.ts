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
}
