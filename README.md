# nostr.nvim

## Install & Configure

```lua
local M = {
  url = "git@github.com:ChristianChiarulli/nostr.nvim.git",
  dependencies = {
    "MunifTanjim/nui.nvim",
  },
  build = ":UpdateRemotePlugins",
}

function M.config()
  require("nostr").setup {}

  vim.api.nvim_set_keymap("n", "<c-n>", '<cmd>lua require("nostr").read_from_relay()<cr>', { noremap = true })
end

return M
```

## Neovim Node Client

https://github.com/neovim/node-client

## Check if functions are registered

remote/host: node host registered plugins ['nostr']
remote/host: generated rplugin manifest: /Users/cam/.local/share/nvim/rplugin.vim
