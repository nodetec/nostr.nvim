# nostr.nvim

A neovim plugin for interacting with the Nostr social network.

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

## Getting started

Before you are able to post any content you will first need to generate a public and private key pair by running:

```lua
require("nostr").generate_keys()
```

This will create a JSON file in the `~/.config/nostr.nvim/` directory called `keys.json`. You can share your public key with anyone but make sure to keep your private key safe.

If you have already generated a public and private key pair you can skip this step, but make sure to add the keypair to `~/.config/nostr.nvim/keys.json`. The file should look like this:

```json
{
  "privateKey": "your private key",
  "publicKey": "your public key"
}
```

### Posting a blog

To post a blog make sure to have a markdown file open in your current buffer and run:

```lua
require("nostr").publish_blog()
```

You will then be prompted for a summary, an image URL and be asked one final time if you would like to post the blog.

After posting you can head over to [NeoTweet](https://neotweet.com) and view your blog post.

## Functions

```lua
require("nostr").generate_keys()
require("nostr").add_relay()
require("nostr").remove_relay()
require("nostr").list_relays()
require("nostr").set_active_relay()
require("nostr").publish_note()
require("nostr").publish_blog()
require("nostr").decode()
require("nostr").encode()
```

## Neovim Node Client

https://github.com/neovim/node-client

## Check if functions are registered

remote/host: node host registered plugins ['nostr']
remote/host: generated rplugin manifest: /Users/cam/.local/share/nvim/rplugin.vim

## NOTE

I have not implemented removing or editing posts yet.

## TODO

- [ ] private DMs
- [ ] collaborative editing
- [ ] note feed
- [ ] note tags
- [ ] note search
- [ ] edit posts
- [ ] remove posts

