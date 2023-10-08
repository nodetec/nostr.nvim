const keys = require("./lib/keys");
const relayManager = require("./lib/relayManager");
const events = require("./lib/events");
const nip19 = require("./lib/nip19");
require("websocket-polyfill");
const logger = require("./lib/logger");
const utils = require("./lib/utils");

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
    async (args) => {
      const event = events.create(args[0], args[1], args[2]);
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

  plugin.registerFunction(
    "NostrPublishReplaceableParameterizedNote",
    async (args) => {
      logger.log("publishing replaceable parameterized note");

      const title = utils.findFirstH1Header(args[1]);
      const uniqueUrl = utils.createUniqueUrl(title);
      const content = utils.removeFirstH1Header(args[1]);
      const initialTags = args[2]
      const additionaltags = [
        ["d", uniqueUrl],
        ["title", title],
        ["published_at", Math.floor(Date.now() / 1000) + ""],
      ];
      const tags = initialTags.concat(additionaltags);
      const event = events.create(args[0], content, tags);
      logger.log("publishing event: " + JSON.stringify(event));
      await relayManager.publish(event, plugin);
    },
    { sync: false },
  );
};
