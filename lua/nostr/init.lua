M = {}

function M.setup()
	-- print("Nostr setup")
	-- vim.fn["NostrSetup"]()
	-- print("Nostr setup done")
end

function M.config()
  print("Nostr config")
  vim.fn["NostrSetup"]()
  print("Nostr config done")
end

return M
