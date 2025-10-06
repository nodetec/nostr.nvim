# nostr.nvim

A Neovim plugin that brings [Nostr](https://nostr.com) (Notes and Other Stuff Transmitted by Relays) to your editor.

## About

nostr.nvim connects Neovim to the Nostr protocol, allowing you to interact with Nostr relays directly from your editor. Built using Neovim's remote plugin system with TypeScript and [nostr-tools](https://github.com/nbd-wtf/nostr-tools).

## Features

- 🔐 **Key Management** - Generate, import, and manage Nostr keys
- 📝 **Notes** - Post kind 1 notes directly from Neovim
- 💬 **Direct Messages** - Send and receive encrypted DMs (NIP-17)
- 💻 **Code Snippets** - Share code with syntax highlighting (NIP-C0)
- 📚 **Long-form Content** - Publish markdown articles (NIP-23)
- 🏷️ **Frontmatter Support** - YAML frontmatter for article metadata
- 🔄 **Multi-relay Support** - Publish to multiple relays simultaneously
- ⚡ **Buffer Integration** - Post buffer contents as notes, snippets, or articles

## Requirements

- Neovim 0.11.2+
- Node.js 20+
- Global neovim npm package: `npm install -g neovim`

## Installation

### Using [lazy.nvim](https://github.com/folke/lazy.nvim)

```lua
{
  "nodetec/nostr.nvim",
  build = "npm install && npm run build",
  config = function()
    -- Optional: set up keymaps
    vim.keymap.set('n', '<leader>np', ':NostrPostNote ', { desc = 'Post Nostr note' })
    vim.keymap.set('n', '<leader>nb', ':NostrPostBuffer<CR>', { desc = 'Post buffer as note' })
    vim.keymap.set('n', '<leader>ns', ':NostrPostSnippet<CR>', { desc = 'Post code snippet' })
    vim.keymap.set('n', '<leader>nl', ':NostrPostLongform<CR>', { desc = 'Post long-form article' })
    vim.keymap.set('n', '<leader>nm', ':NostrSendDM ', { desc = 'Send Nostr DM' })
    vim.keymap.set('n', '<leader>nM', ':NostrCheckDMs<CR>', { desc = 'Check Nostr DMs' })
  end,
}
```

### Using [packer.nvim](https://github.com/wbthomason/packer.nvim)

```lua
use {
  'nodetec/nostr.nvim',
  run = 'npm install && npm run build',
}
```

After installation, run:
```vim
:UpdateRemotePlugins
```

Then restart Neovim.

## Quick Start

1. **Initialize your configuration:**
   ```vim
   :NostrInit
   ```
   This generates keys and sets up a default relay (wss://relay.damus.io).

2. **Post your first note:**
   ```vim
   :NostrPostNote Hello Nostr from Neovim!
   ```

3. **Check your public key:**
   ```vim
   :NostrShowPubkey
   ```

## Usage

### Setup Commands

#### `:NostrInit`
Initialize Nostr configuration with new keys and default relay.

#### `:NostrGenerateKeys`
Generate a new keypair and save to config.

#### `:NostrImportKey <nsec>`
Import an existing private key from nsec format.
```vim
:NostrImportKey nsec1...
```

#### `:NostrShowPubkey`
Display your public key in both hex and npub format.

#### `:NostrGetNpub`
Copy your npub to the system clipboard.

#### `:NostrSetupRelay`
Configure default relay (wss://relay.damus.io).

### Posting Content

#### `:NostrPostNote <message>`
Post a simple text note (kind 1).
```vim
:NostrPostNote This is my note from Neovim!
```

#### `:NostrPostBuffer`
Post the entire current buffer content as a kind 1 note. Shows confirmation before posting.

#### `:NostrPostSnippet`
Post current buffer as a code snippet (kind 1337, NIP-C0).

Features:
- Auto-detects language from filetype and extension
- Prompts for description
- Shows confirmation with snippet details
- Supports syntax highlighting metadata

Example workflow:
```vim
" Open a code file
:e hello.js
" Write some code...
" Post as snippet
:NostrPostSnippet
```

#### `:NostrPostLongform`
Post current buffer as a long-form article (kind 30023, NIP-23).

Features:
- Extracts YAML frontmatter for metadata
- Uses `# Title` header if no frontmatter exists
- Prompts for title, summary, and topics
- Auto-generates or uses custom identifier
- Updates frontmatter with identifier after posting
- Auto-saves file after posting

Frontmatter example:
```yaml
---
title: My Article Title
identifier: my-custom-slug
summary: A brief description
image: https://example.com/image.jpg
tags: nostr, neovim, programming
---

# Article content starts here...
```

#### `:NostrAddFrontmatter`
Add YAML frontmatter to current markdown buffer. Prompts for:
- Title (auto-detected from `# Header` if present)
- Identifier (optional, auto-generated if empty)
- Summary (optional)
- Image URL (optional)
- Topics/tags (comma-separated, optional)

### Direct Messages

#### `:NostrSendDM <npub/hex> <message>`
Send an encrypted direct message (NIP-17).
```vim
:NostrSendDM npub1... Hello from Neovim!
```

#### `:NostrCheckDMs`
Fetch and display recent direct messages in a popup window.
- Shows sender, timestamp, and message content
- Press `q` to close the window
- Displays last 20 messages

### Reading Content

#### `:NostrGetNotes <npub/hex>`
Fetch and display notes from a specific user.
```vim
:NostrGetNotes npub1...
```
Shows the last 20 notes in a popup window.

## Configuration

Configuration is stored in `~/.config/nostr.nvim/config.json`:

```json
{
  "privateKey": "hex-format-private-key",
  "publicKey": "hex-format-public-key",
  "relays": [
    "wss://relay.damus.io",
    "wss://nos.lol"
  ]
}
```

You can manually edit this file to:
- Add multiple relays
- Change keys
- Configure other settings

**Warning:** Keep your private key secure! The config file contains your private key in plaintext.

## NIPs Supported

- **NIP-01**: Basic protocol flow
- **NIP-17**: Private Direct Messages (encrypted DMs)
- **NIP-19**: bech32-encoded entities (npub, nsec)
- **NIP-23**: Long-form Content (kind 30023 articles)
- **NIP-C0**: Code Snippets (kind 1337)

## Tips & Tricks

### Posting Articles from Markdown Files

1. Write your article in markdown
2. Add frontmatter with `:NostrAddFrontmatter`
3. Edit and refine your content
4. Post with `:NostrPostLongform`
5. The identifier is saved to frontmatter automatically
6. Future posts with the same identifier will update the article

### Code Snippet Workflow

1. Open or create a code file
2. Write your code
3. Run `:NostrPostSnippet`
4. Add a description
5. Confirm and post

### Multi-Relay Setup

Edit `~/.config/nostr.nvim/config.json` to add more relays:
```json
{
  "relays": [
    "wss://relay.damus.io",
    "wss://relay.notebin.io",
  ]
}
```

The plugin will attempt to publish to all configured relays.

## Troubleshooting

### Commands not found after installation

Make sure you've run `:UpdateRemotePlugins` and restarted Neovim.

### "neovim package not found" error

Install the global neovim package:
```bash
npm install -g neovim
```

### Build errors

Ensure you have Node.js 16+ installed:
```bash
node --version
npm install
npm run build
```

### Plugin not loading

Check Neovim's health:
```vim
:checkhealth
```

Verify the plugin is installed:
```vim
:scriptnames
```

### Can't connect to relays

- Check your internet connection
- Verify relay URLs in `~/.config/nostr.nvim/config.json`
- Try using well-known relays like `wss://relay.damus.io`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Search and filter notes
- [ ] Profile management
- [ ] Reaction support (kind 7)
- [ ] Repost/quote support
- [ ] Custom relay configuration per command
- [ ] Threading/replies support
- [ ] Zap support (Lightning payments)
- [ ] Media uploads via blossom
- [ ] Note templates
- [ ] Vim motions for navigating notes

## Development

### Local Development with lazy.nvim

To develop the plugin locally using [lazy.nvim](https://github.com/folke/lazy.nvim):

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nodetec/nostr.nvim.git ~/path/to/nostr.nvim
   cd ~/path/to/nostr.nvim
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure lazy.nvim to use your local clone:**
   ```lua
   -- In your Neovim config (e.g., ~/.config/nvim/lua/plugins/nostr.lua)
   return {
     dir = "~/path/to/nostr.nvim",  -- Use local directory instead of GitHub
     build = "npm run build",        -- Build on install/update
     config = function()
       -- Optional: set up keymaps or other config
     end,
   }
   ```

4. **Build the plugin:**
   ```bash
   npm run build
   ```

5. **Update remote plugins in Neovim:**
   ```vim
   :UpdateRemotePlugins
   ```

6. **Restart Neovim** to load the plugin.

### Development Workflow

After making changes to the TypeScript source:

```bash
# Rebuild the plugin
npm run build

# Or use watch mode for automatic rebuilds
npm run dev
```

Then in Neovim:
```vim
:UpdateRemotePlugins
:restart
```

**Note:** The plugin requires Node.js and the global `neovim` package:
```bash
npm install -g neovim
```

### Project Structure

```
nostr.nvim/
├── lua/nostr/           # Lua plugin interface
├── src/                 # TypeScript source code
│   ├── index.ts        # Main plugin entry point
│   └── lib/            # Library functions
│       ├── config.ts   # Configuration management
│       ├── keys.ts     # Key generation and management
│       ├── message.ts  # Direct messaging (NIP-17)
│       ├── note.ts     # Note posting (kind 1)
│       ├── snippet.ts  # Code snippets (NIP-C0)
│       └── longform.ts # Long-form content (NIP-23)
├── rplugin/node/nostr/ # Compiled JavaScript output
└── package.json        # Node.js dependencies
```

## Resources

- [Nostr Protocol](https://github.com/nostr-protocol/nostr)
- [NIPs (Nostr Implementation Possibilities)](https://github.com/nostr-protocol/nips)
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools)
- [Awesome Nostr](https://github.com/aljazceru/awesome-nostr)

## License

MIT

---

**Made with 💜 for the Nostr community**
