local M = {}

function M.input(action, prompt, args)
	local Input = require("nui.input")
	local event = require("nui.utils.autocmd").event

	local popup_options = {
		position = "40%",
		size = 40,
		border = {
			style = "rounded",
			text = {
				top = prompt or "",
				top_align = "left",
			},
		},
		win_options = {
			winhighlight = "Normal:Normal",
		},
	}

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

	input:mount()

	-- unmount component when cursor leaves buffer
	input:on(event.BufLeave, function()
		input:unmount()
	end)

	input:map("n", "<Esc>", function()
		input:unmount()
	end, { noremap = true })

	-- local input = vim.fn.input("message: ")
end

return M
