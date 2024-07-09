# nostr.nvim

## Install

Lazy spec:

```lua
local M = {
  "nodetec/nostr.nvim",
  dependencies = {
    "MunifTanjim/nui.nvim",
  },
  build = { "npm install", "npm run build", ":UpdateRemotePlugins" },
}

function M.config()
  require("nostr").setup {}
end

return M
```

## Getting Started

To get started run the command:

```
:NostrGenerateConfig
```

This will create a config file at `~/.local/share/nostr.nvim/config.json` where you can change your `nsec` and `npub` if you already have a keypair.

## Post a note to nostr

```
:NostrSendNote Hello Nostr from Neovim!
```
