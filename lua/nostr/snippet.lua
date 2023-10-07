local M = {}

local Input = require("nui.input")
local event = require("nui.utils.autocmd").event

local popup_options = {
	position = "40%",
	size = 40,
	border = {
		style = "rounded",
		text = {
			-- top = prompt or "",
			top_align = "left",
		},
	},
	win_options = {
		winhighlight = "Normal:Normal",
	},
}

local function add_binds(input)
	input:mount()

	-- unmount component when cursor leaves buffer
	-- input:on(event.BufLeave, function()
	-- 	input:unmount()
	-- end)

	input:map("n", "<Esc>", function()
		input:unmount()
	end, { noremap = true })
end

function M.post()
	local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
	local buffer_content = table.concat(lines, "\n")
	popup_options.border.text.top = "Enter title"
	local filetype = vim.api.nvim_buf_get_option(0, "filetype")
	local title_input = Input(popup_options, {
		prompt = "> ",
		default_value = "",
		on_submit = function(title)
			vim.ui.select({ "yes", "no" }, {
				prompt = "Post snippet?",
			}, function(choice)
				if choice == "yes" then
					vim.fn["NostrPublishNote"](
						1050,
						buffer_content,
						{ { "title", title }, { "filetype", filetype } }
					)
				end
			end)
		end,
	})
	add_binds(title_input)
end

return M
