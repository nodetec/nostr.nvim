# nostr.nvim

A Neovim plugin that brings [Nostr](https://nostr.com) (Notes and Other Stuff Transmitted by Relays) to your editor.

## About

nostr.nvim connects Neovim to the Nostr protocol, allowing you to interact with Nostr relays directly from your editor. Built using Neovim's remote plugin system with TypeScript and [nostr-tools](https://github.com/nbd-wtf/nostr-tools).

## Features

Coming soon...

## Installation

Coming soon...

## Usage

Coming soon...

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

## License

MIT
