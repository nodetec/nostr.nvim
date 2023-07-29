const keys = require('./lib/keys');
const relayManager = require('./lib/relayManager');

module.exports = plugin => {
  plugin.setOptions({ dev: true });

  plugin.registerFunction('NostrGenerateKeys', async () => {
    keys.getKeyPair();
  }, { sync: false });

  plugin.registerFunction('NostrAddRelay', async (url) => {
    relayManager.addRelay(url, plugin);
  }, { sync: false });

  plugin.registerFunction('NostrRemoveRelay', async (url) => {
    relayManager.removeRelay(url);
  }, { sync: false });

  plugin.registerFunction('NostrListRelays', async () => {
    return relayManager.listRelays(plugin);
  }, { sync: false });

  plugin.registerFunction('NostrSetActiveRelay', async (url) => {
    await relayManager.setActiveRelay(url, plugin);
  }, { sync: false });
};

