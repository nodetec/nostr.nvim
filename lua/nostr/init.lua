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

-- TODO: multiple active relays for reading and posting
function M.set_active_relay()
	local relays = vim.fn["NostrListRelays"]()

	vim.ui.select(relays, {
		prompt = "Set Active Relay:",
		-- TODO: check if active relay is set and mark it
		-- format_item = function(item)
		-- 	return ("%s: %s"):format(item, vals[item])
		-- end,
	}, function(choice)
		if choice then
			vim.fn["NostrSetActiveRelay"](choice)
			vim.notify(choice .. "set active!")
		end
	end)
end

function M.publish_note()
	ui.input(vim.fn["NostrPublishNote"], "Enter note: ")
end

function M.encode()
	vim.ui.select({ "npub", "nsec" }, {
		prompt = "Set Active Relay:",
	}, function(choice)
		if choice == "npub" then
			ui.input(vim.fn["NostrNpubEncode"], "Encode: ")
		end
		if choice == "nsec" then
			ui.input(vim.fn["NostrNsecEncode"], "Encode: ")
		end
	end)
end

function M.decode()
	ui.input(vim.fn["NostrDecode"], "Decode: ")
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
