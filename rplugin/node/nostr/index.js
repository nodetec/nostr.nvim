"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_nostr_tools = require("nostr-tools");
var import_pool = require("nostr-tools/pool");
var import_ws = __toESM(require("ws"));
(0, import_pool.useWebSocketImplementation)(import_ws.default);
var plugin = (nvim) => {
  nvim.setOptions({ dev: true });
  nvim.registerCommand("SendMessage", async () => {
    const npub = "npub105p3vlhq8kvmk99f0e8dpsa95haqthvjdfxemrj3fv64226rx44q2t0kr4";
    const nsec = "nsec1vdux8mkv4qrpz2epj2qmgmwytd5lw6mp59hsqlwycuyus64cvzwqn7gmgk";
    const sk = import_nostr_tools.nip19.decode(nsec).data;
    const pk = import_nostr_tools.nip19.decode(npub).data;
    let event = (0, import_nostr_tools.finalizeEvent)(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1e3),
        tags: [],
        content: "hello from neovim! 2"
      },
      sk
    );
    let isGood = (0, import_nostr_tools.verifyEvent)(event);
    console.log(`isGood: ${isGood}`);
    console.log(`event: ${event.content}`);
    console.log(`pk: ${import_nostr_tools.nip19.npubEncode(pk)}`);
    console.log(`sk: ${import_nostr_tools.nip19.nsecEncode(sk)}`);
    const pool = new import_pool.SimplePool();
    let relays = ["wss://relay.damus.io"];
    await Promise.any(pool.publish(relays, event));
    nvim.nvim.command(
      `lua vim.notify("Published note: ${event.content}", "info")`
    );
  });
  nvim.registerCommand("ListenForNotes", async () => {
    const npub = "npub105p3vlhq8kvmk99f0e8dpsa95haqthvjdfxemrj3fv64226rx44q2t0kr4";
    const pool = new import_pool.SimplePool();
    let relays = ["wss://relay.damus.io"];
    const pk = import_nostr_tools.nip19.decode(npub).data;
    let h = pool.subscribeMany(
      relays,
      [
        {
          authors: [pk]
        }
      ],
      {
        onevent(event) {
          nvim.nvim.command(
            `lua vim.notify("Recived note: ${event.content}", "info")`
          );
        },
        oneose() {
        }
      }
    );
  });
};
var src_default = plugin;
