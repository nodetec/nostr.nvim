const nostr = require("nostr-tools");
require("websocket-polyfill");
const fs = require("fs");


function logme(msg) {
  fs.appendFile("/Users/chris" + "/.local/state/nostr.log", msg + "\n", (err) => {
    if (err) throw err;
  });
}


module.exports = plugin => {
  plugin.setOptions({ dev: true });

  plugin.registerFunction('ReadFromRelay', async (test) => {
    try {
      logme("====================================");
      const relay = nostr.relayInit("wss://relay.damus.io");

      relay.on("connect", () => {
        logme(`connected to ${relay.url}`);
      });

      relay.on("error", () => {
        logme(`failed to connect to ${relay.url}`);
      });

      await relay.connect();

      let events = []

      let sub = relay.sub([
        {
          "kinds": [1],
          limit: 5,
        },
      ]);

      sub.on("event", (event) => {
        events.push(event)
      });

      sub.on("eose", () => {
        try {
          plugin.nvim.setVar('events', JSON.stringify(events));
        } catch (err) {
          logme("error: " + err);
        }

        plugin.nvim.command(`lua require("nostr").show_notes(vim.g.events)`);
        sub.unsub();
      });


    } catch (err) {
      console.error(err);
    }
  }, { sync: false });

  plugin.registerFunction('PublishToRelay', () => {

    let sk = nostr.generatePrivateKey();
    let pk = nostr.getPublicKey(sk);
    logme(test)

    logme("private key " + sk);
    logme("public key " + pk);

    logme("PublishToRelay");
    return 'May I offer you an egg in these troubling times'
    // .then(() => logme('Line should be set'))
  }, { sync: true })

};

