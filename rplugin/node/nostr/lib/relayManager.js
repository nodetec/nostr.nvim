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
let activeRelay = relays.active || null;
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
  relays.relays = relays.relays.filter((relay) => relay !== url);
  fs.writeFileSync(RELAYS_PATH, JSON.stringify(relays, null, 2));
}

function listRelays(plugin) {
  logger.log("Listing relays" + JSON.stringify(relays.relays));
  plugin.nvim.outWrite(JSON.stringify(relays) + "\n");
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

async function publish(relays, event, onOk, onFailed) {
  logger.log("publishing to relays:", relays);
  for (const url of relays) {
    const relay = await connectedRelay.getState().connect(url);

    if (!relay) return;

    let pub = relay.publish(event);

    pub.on("ok", () => {
      logger.log(`${url} has accepted our event`);
      onOk();
    });

    pub.on("failed", (reason) => {
      logger.log(`failed to publish to ${url}: ${reason}`);
      onFailed();
    });
  }
}

module.exports = {
  addRelay,
  removeRelay,
  listRelays,
  setActiveRelay,
  activeRelay,
  connect,
};
