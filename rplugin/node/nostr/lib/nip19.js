const nostr = require("nostr-tools");
const logger = require("./logger");

function decode(input, plugin) {
  logger.log("Decoding: " + input);
  const { type, data } = nostr.nip19.decode(input);
  logger.log("Decoded: " + JSON.stringify({ type, data }));
  plugin.nvim.command(`let @+ = "${data}"`);
  plugin.nvim.command(`lua vim.notify("${data} copied to clipboard!", "info")`);
  return data;
}

function npubEncode(input, plugin) {
  const encoded = nostr.nip19.npubEncode(input);
  plugin.nvim.command(`let @+ = "${encoded}"`);
  plugin.nvim.command(
    `lua vim.notify("${encoded} copied to clipboard!", "info")`,
  );
}

function nsecEncode(input, plugin) {
  const encoded = nostr.nip19.nsecEncode(input);
  plugin.nvim.command(`let @+ = "${encoded}"`);
  plugin.nvim.command(
    `lua vim.notify("${encoded} copied to clipboard!", "info")`,
  );
}

module.exports = {
  decode,
  npubEncode,
  nsecEncode,
};
