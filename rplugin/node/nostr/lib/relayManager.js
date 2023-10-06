const fs = require("fs");
const path = require("path");
const os = require("os");
const { validateRelay } = require("./utils"); // Some utility function to validate relay URL
const logger = require("./logger");
const nostr = require("nostr-tools");
require("websocket-polyfill");

const RELAYS_PATH = path.join(
  os.homedir(),
  ".config",
  "nostr.nvim",
  "relays.json",
);

let relays = loadRelays();
let activeRelay = relays.active || "wss://relay.damus.io";
let connectedRelay = null;

function loadRelays() {
  if (!fs.existsSync(RELAYS_PATH)) {
    fs.writeFileSync(RELAYS_PATH, JSON.stringify({ relays: [], active: null }));
    return { relays: [], active: null };
  }

  return JSON.parse(fs.readFileSync(RELAYS_PATH, "utf8"));
}

function addRelay(url, plugin) {
  if (!validateRelay(url)) {
    logger.log("Invalid relay URL");
    plugin.nvim.command('lua vim.notify("Invalid relay URL", "error")');
    return;
  }

  // HACK: no idea why this is an array
  relays.relays.push(url[0]);
  fs.writeFileSync(RELAYS_PATH, JSON.stringify(relays, null, 2));
  logger.log("Relay added");
  plugin.nvim.command('lua vim.notify("Relay added", "info")');
}

function removeRelay(url) {
  relays.relays = relays.relays.filter((relay) => relay !== url[0]);
  fs.writeFileSync(RELAYS_PATH, JSON.stringify(relays, null, 2));
}

function listRelays(plugin) {
  logger.log("Listing relays" + JSON.stringify(relays.relays));
  // plugin.nvim.outWrite(JSON.stringify(relays) + "\n");
  return relays.relays;
}

async function connect(url, plugin) {
  logger.log("Connecting to " + url);
  connectedRelay = nostr.relayInit(url);

  connectedRelay.on("connect", () => {
    logger.log(`connected to ${connectedRelay.url}`);
  });

  connectedRelay.on("error", () => {
    logger.log(`failed to connect to ${connectedRelay.url}`);
  });

  await connectedRelay.connect();
}

async function setActiveRelay(url, plugin) {
  logger.log(relays.relays);
  if (!relays.relays.includes(url[0])) {
    logger.log("Relay not found");
    plugin.nvim.command('lua vim.notify("Invalid relay URL", "error")');
    return;
  }

  relays.active = url[0];
  fs.writeFileSync(RELAYS_PATH, JSON.stringify(relays, null, 2));
  activeRelay = url[0];
  logger.log("Active relay set to " + url);
  await connect(url[0], plugin);
  plugin.nvim.command('lua vim.notify("Relay set", "info")');
}

async function publish(event, plugin) {
  if (connectedRelay === null) {
    plugin.nvim.command(
      `lua vim.notify("Connecting to ${activeRelay}", "info")`,
    );
    connectedRelay = nostr.relayInit(activeRelay);
  }
  logger.log("publishing event: " + JSON.stringify(event));
  await connectedRelay.connect();
  await connectedRelay.publish(event);
  logger.log("published event: " + JSON.stringify(event));
  let publishedEvent = await connectedRelay.get({
    ids: [event.id],
  });
  if (publishedEvent) {
    plugin.nvim.command('lua vim.notify("Note published", "info")');
    return;
  }
  plugin.nvim.command('lua vim.notify("Failed to publish note", "error")');
}

module.exports = {
  addRelay,
  removeRelay,
  listRelays,
  setActiveRelay,
  activeRelay,
  connect,
  publish,
};
