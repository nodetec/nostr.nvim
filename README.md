# nostr.nvim

## Install (Lazy)

```lua
local M = {
  "ChristianChiarulli/nostr.nvim",
  dependencies = {
    "MunifTanjim/nui.nvim",
  },
  build ={ "cd rplugin/node/nostr && npm i",  ":UpdateRemotePlugins", }
}

function M.config()
  require("nostr").setup {}
end

return M
```

## Functions

```lua
require("nostr").generate_keys()
require("nostr").add_relay()
require("nostr").remove_relay()
require("nostr").list_relays()
require("nostr").set_active_relay()
require("nostr").publish_note()
require("nostr").decode()
require("nostr").encode()
```

## Neovim Node Client

https://github.com/neovim/node-client

## Check if functions are registered

remote/host: node host registered plugins ['nostr']
remote/host: generated rplugin manifest: /Users/cam/.local/share/nvim/rplugin.vim
