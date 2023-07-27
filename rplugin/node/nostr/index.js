const nostr = require("nostr-tools");
require("websocket-polyfill");

const generatePrivateKey = nostr.generatePrivateKey;
const getPublicKey = nostr.getPublicKey;
const initializeRelay = nostr.relayInit;
const getEventHash = nostr.getEventHash;
// NOTE: this function will soon be deprecated
const signEvent = nostr.signEvent;
// const getSignature = nostr.getSignature;

const fs = require("fs");

const HOME = process.env.HOME;
const NOSTR_DEV_MODE = process.env.NOSTR_DEV_MODE;

let dev = false;
if (NOSTR_DEV_MODE) {
  dev = true;
}


// HACK: this is a hack to get logging working
function logme(msg) {
  fs.appendFile(HOME + "/.local/state/nostr.log", msg + "\n", (err) => {
    if (err) throw err;
  });
}

const readConfig = () => {
  fs.readFile(HOME + "/.config/nostr-nvim/config.json", (err, data) => {
    if (err) throw err;
    let student = JSON.parse(data);
    logme(student);
  });

  return student;
};

module.exports = (plugin) => {
  plugin.setOptions({ dev: dev });

  plugin.registerCommand(
    "ReadFromRelay",
    async () => {
      try {
        logme("before");
        const relay = initializeRelay("wss://nostr-pub.wellorder.net");
        logme("relay initialized");
        relay.on("connect", () => {
          logme(`connected to ${relay.url}`);
        });
        logme("after connect");
        relay.on("error", () => {
          logme(`failed to connect to ${relay.url}`);
        });

        await relay.connect();

        // let's query for an event that exists
        let sub = relay.sub([
          {
            ids: [
              "d7dd5eb3ab747e16f8d0212d53032ea2a7cadef53837e5a6c66d42849fcb9027",
            ],
          },
        ]);
        sub.on("event", (event) => {
          logme("we got the event we wanted: " + JSON.stringify(event));
        });
        sub.on("eose", () => {
          sub.unsub();
        });
      } catch (err) {
        console.error(err);
      }
    },
    { sync: false }
  );

  plugin.registerFunction(
    "PublishToRelay",
    async () => {
      try {
        // logme("test message is: " + msg);
        const relay = initializeRelay("wss://nostr-pub.wellorder.net");
        relay.on("connect", () => {
          logme(`connected to ${relay.url}`);
        });
        relay.on("error", () => {
          logme(`failed to connect to ${relay.url}`);
        });

        logme("before connect");
        await relay.connect();
        logme("after connect");

        // let's publish a new event while simultaneously monitoring the relay for it
        let sk = generatePrivateKey();
        let pk = getPublicKey(sk);
        logme("pk is: " + pk);
        logme("sk is: " + sk);

        let event = {
          kind: 1,
          pubkey: pk,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello from neovim town",
        };
        event.id = getEventHash(event);
        event.sig = signEvent(event, sk);

        logme("event is: " + JSON.stringify(event));

        let pub = relay.publish(event);
        pub.on("ok", () => {
          logme(`${relay.url} has accepted our event`);
        });
        pub.on("failed", (reason) => {
          logme(`failed to publish to ${relay.url}: ${reason}`);
        });

        relay.close();
      } catch (err) {
        logme("failed to send message message: " + msg);
      }
    },
    { sync: false }
  );
};
