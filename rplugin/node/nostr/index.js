const keys = require("./lib/keys");
const relayManager = require("./lib/relayManager");
const events = require("./lib/events");
const nip19 = require("./lib/nip19");
require("websocket-polyfill");
const logger = require("./lib/logger");

module.exports = (plugin) => {
  plugin.setOptions({ dev: true });

  plugin.registerFunction(
    "NostrGenerateKeys",
    async () => {
      keys.getKeyPair();
    },
    { sync: false },
  );

  plugin.registerFunction(
    "NostrAddRelay",
    async (url) => {
      relayManager.addRelay(url, plugin);
    },
    { sync: false },
  );

  plugin.registerFunction(
    "NostrRemoveRelay",
    async (url) => {
      relayManager.removeRelay(url);
    },
    { sync: false },
  );

  plugin.registerFunction(
    "NostrListRelays",
    async () => {
      return relayManager.listRelays(plugin);
    },
    { sync: true },
  );

  plugin.registerFunction(
    "NostrSetActiveRelay",
    async (url) => {
      await relayManager.setActiveRelay(url, plugin);
    },
    { sync: false },
  );

  plugin.registerFunction(
    "NostrPublishNote",
    async (message) => {
      const event = events.create(1, [], message[0]);
      logger.log("publishing event: " + JSON.stringify(event));
      await relayManager.publish(event, plugin);
    },
    { sync: false },
  );

  plugin.registerFunction(
    "NostrDecode",
    async (input) => {
      nip19.decode(input[0], plugin);
    },
    { sync: true },
  );

  plugin.registerFunction(
    "NostrNpubEncode",
    async (input) => {
      return nip19.npubEncode(input[0], plugin);
    },
    { sync: true },
  );

  plugin.registerFunction(
    "NostrNsecEncode",
    async (input) => {
      return nip19.nsecEncode(input[0], plugin);
    },
    { sync: true },
  );
};
