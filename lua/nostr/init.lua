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

function M.open_menu()
	-- Define the menu items
	local items = {
		"Option 1",
		"Option 2",
		"Option 3",
		"Quit",
	}

	-- Create a buffer for the menu
	local buf = vim.api.nvim_create_buf(false, true)

	-- Set the buffer lines to the menu items
	vim.api.nvim_buf_set_lines(buf, 0, -1, false, items)

	-- Get the current editor dimensions
	local width = vim.opt.columns:get()
	local height = vim.opt.lines:get()

	-- Define the window dimensions and position
	local win_width = math.ceil(width * 0.4)
	local win_height = #items + 2
	local row = math.ceil((height - win_height) / 2)
	local col = math.ceil((width - win_width) / 2)

	-- Create a floating window for the menu
	local win = vim.api.nvim_open_win(buf, true, {
		relative = "editor",
		width = win_width,
		height = win_height,
		row = row,
		col = col,
		style = "minimal",
		border = "rounded",
	})

	-- Set some options for the buffer and window
	vim.bo[buf].modifiable = false
	vim.bo[buf].bufhidden = "wipe"
	vim.wo[win].cursorline = true

  -- Set key mappings for the menu
	vim.keymap.set("n", "j", function()
		require("nostr.lib.keys").handle_key("j", win, items)
	end, { buffer = buf })

	vim.keymap.set("n", "k", function()
		require("nostr.lib.keys").handle_key("k", win, items)
	end, { buffer = buf })

	vim.keymap.set("n", "<CR>", function()
		require("nostr.lib.keys").handle_key("<CR>", win, items)
	end, { buffer = buf })

	vim.keymap.set("n", "<ESC>", function()
		require("nostr.lib.keys").handle_key("<ESC>", win, items)
	end, { buffer = buf })
end

return M
