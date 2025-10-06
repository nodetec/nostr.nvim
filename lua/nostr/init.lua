local M = {}

-- Initialize Nostr config (generate keys + setup default relay)
function M.init()
  vim.cmd('NostrInit')
end

-- Generate new Nostr keypair
function M.generate_keys()
  vim.cmd('NostrGenerateKeys')
end

-- Import existing nsec key
function M.import_key(nsec)
  if nsec then
    vim.cmd('NostrImportKey ' .. nsec)
  else
    vim.cmd('NostrImportKey')
  end
end

-- Show public key
function M.show_pubkey()
  vim.cmd('NostrShowPubkey')
end

-- Get npub (print just the npub value)
function M.get_npub()
  vim.cmd('NostrGetNpub')
end

-- Set up default relay (Damus)
function M.setup_relay()
  vim.cmd('NostrSetupRelay')
end

-- Send encrypted direct message (NIP-17)
function M.send_dm(recipient, message)
  if recipient and message then
    vim.cmd('NostrSendDM ' .. recipient .. ' ' .. message)
  else
    vim.cmd('NostrSendDM')
  end
end

-- Check incoming direct messages
function M.check_dms()
  vim.cmd('NostrCheckDMs')
end

return M
