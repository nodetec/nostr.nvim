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
	input:on(event.BufLeave, function()
		input:unmount()
	end)

	input:map("n", "<Esc>", function()
		input:unmount()
	end, { noremap = true })
end

function M.input(action, prompt, args)
	if prompt then
		popup_options.border.text.top = prompt
	end

	local input = Input(popup_options, {
		prompt = "> ",
		default_value = "",
		on_submit = function(value)
			if args then
				action(value, args)
			else
				action(value)
			end
		end,
	})

	add_binds(input)
end

function M.post_blog(prompt)
	popup_options.border.text.top = prompt
	local input = Input(popup_options, {
		prompt = "> ",
		default_value = "",
		on_submit = function(value)
			return value
		end,
	})

	add_binds(input)
end

return M
