local ui = require("nostr.ui")

local M = {}

M.opts = {}

function M.setup(opts)
	M.opts = {
		relay = opts.relay or "default_value1",
		option2 = opts.option2 or "default_value2",
	}
end

function M.generate_keys()
	vim.fn["NostrGenerateKeys"]()
	vim.notify("keys generated!")
end

function M.add_relay()
	ui.input(vim.fn["NostrAddRelay"], "Enter relay url: ")
end

function M.remove_relay(url)
	vim.fn["NostrRemoveRelay"](url)
	vim.notify("relay removed!")
end

function M.list_relays()
	local relays = vim.fn["NostrListRelays"]()
	print(vim.inspect(relays))
	vim.notify("relays listed!")
end

function M.set_active_relay(url)
	vim.fn["NostrSetActiveRelay"](url)
	vim.notify(url .. "set active!")
end

function M.publish_note()
	ui.input(vim.fn["NostrPublishNote"], "Enter note: ")
end

function M.encode()
	ui.input(vim.fn["NostrPublishNote"], "Encode: ")
end

function M.decode()
	ui.input(vim.fn["NostrPublishNote"], "Decode: ")
end

-- function M.show_notes(eventsStr)
-- 	local Popup = require("nui.popup")
-- 	local event = require("nui.utils.autocmd").event
--
-- 	local popup = Popup({
-- 		enter = true,
-- 		focusable = true,
-- 		border = {
-- 			style = "rounded",
-- 			text = {
-- 				top = " Notes ",
-- 				top_align = "center",
-- 			},
-- 		},
-- 		position = "50%",
-- 		size = {
-- 			width = "60%",
-- 			height = "60%",
-- 		},
-- 		buf_options = {
-- 			modifiable = true,
-- 			readonly = false,
-- 			filetype = "nostr_notes",
-- 		},
-- 		win_options = {
-- 			-- winblend = 10,
-- 			winhighlight = "Normal:Normal,FloatBorder:Constant",
-- 			wrap = true,
-- 		},
-- 	})
--
-- 	popup:mount()
--
-- 	popup:on(event.BufLeave, function()
-- 		popup:unmount()
-- 	end)
--
-- 	popup:map("n", "q", function()
-- 		-- vim.cmd("bd!")
-- 		popup:hide()
-- 	end, { noremap = true })
--
-- 	popup:map("n", "<s-l>", function()
-- 		popup.border:set_text("bottom", " 2/3 ", "right")
-- 	end, { noremap = true })
--
-- 	local events = vim.fn.json_decode(eventsStr)
-- 	local lines = {}
--
-- 	if events == nil then
-- 		print("No events found")
-- 		return
-- 	end
--
-- 	for _, e in ipairs(events) do
-- 		local result = e.content:gsub("\n", "")
-- 		table.insert(lines, result)
-- 		table.insert(lines, "")
-- 		print(e.content)
-- 	end
--
-- 	vim.api.nvim_buf_set_lines(popup.bufnr, 0, -1, false, lines)
-- end
--
return M
