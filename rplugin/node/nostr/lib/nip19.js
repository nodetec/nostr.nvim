const nostr = require("nostr-tools");
const logger = require("./logger");

function decode(input, plugin) {
  logger.log("Decoding: " + input);
  let { type, data } = nostr.nip19.decode(input);
  logger.log("Decoded: " + JSON.stringify({ type, data }));

  if (type === "naddr" || type === "nevent" || type === "nprofile") {
    data = JSON.stringify(data);
  }

  // replace all double quotes with single quotes
  data = data.replace(/"/g, '\\"');

  plugin.nvim.command(`let @+ = "${data}"`);
  logger.log("COPIED");
  plugin.nvim.command(`lua vim.notify("${data} copied to clipboard!", "info")`);
  logger.log("DECODED: " + data);
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
