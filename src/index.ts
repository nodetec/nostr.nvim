import { NvimPlugin, Neovim } from "neovim";
import {
  // generateSecretKey,
  // getPublicKey,
  finalizeEvent,
  verifyEvent,
  nip19,
} from "nostr-tools";
import { SimplePool, useWebSocketImplementation } from "nostr-tools/pool";
import WebSocket from "ws";
useWebSocketImplementation(WebSocket);

const plugin = (nvim: NvimPlugin) => {
  nvim.setOptions({ dev: true });
  nvim.registerCommand("SendMessage", async () => {
    // let sk = generateSecretKey();
    // let pk = getPublicKey(sk);

    const npub =
      "npub105p3vlhq8kvmk99f0e8dpsa95haqthvjdfxemrj3fv64226rx44q2t0kr4";
    const nsec =
      "nsec1vdux8mkv4qrpz2epj2qmgmwytd5lw6mp59hsqlwycuyus64cvzwqn7gmgk";

    const sk = nip19.decode(nsec).data;
    const pk = nip19.decode(npub).data;

    let event = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: "hello from neovim! 2",
      },
      sk,
    );

    let isGood = verifyEvent(event);

    console.log(`isGood: ${isGood}`);
    console.log(`event: ${event.content}`);

    console.log(`pk: ${nip19.npubEncode(pk)}`);
    console.log(`sk: ${nip19.nsecEncode(sk)}`);

    const pool = new SimplePool();

    let relays = ["wss://relay.damus.io"];

    await Promise.any(pool.publish(relays, event));

    nvim.nvim.command(
      `lua vim.notify("Published note: ${event.content}", "info")`,
    );

    // Neovim.EventEmitter.em
  });

  nvim.registerCommand("ListenForNotes", async () => {
    const npub =
      "npub105p3vlhq8kvmk99f0e8dpsa95haqthvjdfxemrj3fv64226rx44q2t0kr4";
    const pool = new SimplePool();

    let relays = ["wss://relay.damus.io"];

    const pk = nip19.decode(npub).data;

    let h = pool.subscribeMany(
      relays,
      [
        {
          authors: [pk],
        },
      ],
      {
        onevent(event) {
          // this will only be called once the first time the event is received
          // ...
          nvim.nvim.command(
            `lua vim.notify("Recived note: ${event.content}", "info")`,
          );
        },
        oneose() {
          // h.close();
        },
      },
    );
  });
};

export default plugin;
