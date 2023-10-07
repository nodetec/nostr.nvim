local M = {}

local Input = require("nui.input")
local event = require("nui.utils.autocmd").event

local popup_options = {
	position = "40%",
	size = 40,
	border = {
		style = "rounded",
		text = {
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
	popup_options.border.text.top = "Enter note"
	local note_input = Input(popup_options, {
		prompt = "> ",
		default_value = "",
		on_submit = function(note_input)
			vim.fn["NostrPublishNote"](1, note_input, {})
		end,
	})
	add_binds(note_input)
end

return M
