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
