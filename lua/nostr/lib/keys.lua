M = {}

function M.handle_key(key, win, items)
	local cursor = vim.api.nvim_win_get_cursor(win)
	local line = cursor[1]

	local actions = {
		["j"] = function()
			-- Move the cursor down
			local new_line = math.min(line + 1, #items)
			vim.api.nvim_win_set_cursor(win, { new_line, 0 })
		end,
		["k"] = function()
			-- Move the cursor up
			local new_line = math.max(line - 1, 1)
			vim.api.nvim_win_set_cursor(win, { new_line, 0 })
		end,
		["<CR>"] = function()
			-- Handle selection
			local selection = items[line]
			vim.api.nvim_win_close(win, true)
			if selection == "Quit" then
				return
			end
			print("You selected: " .. selection)
		end,
		["<Esc>"] = function()
			-- Close the menu on Escape
			vim.api.nvim_win_close(win, true)
		end,
	}

	-- Execute the corresponding action if it exists
	if actions[key] then
		actions[key]()
	end
end

return M
