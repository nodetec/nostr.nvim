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
var import_pool = require("nostr-tools/pool");
var import_ws = __toESM(require("ws"));

// src/lib/config.ts
var fs = __toESM(require("fs-extra"));
var path = __toESM(require("path"));
var import_nostr_tools = require("nostr-tools");
var configDir = path.join(process.env.HOME || "", ".config", "nostr.nvim");
var configFile = path.join(configDir, "config.json");
async function generateConfig() {
  if (!await fs.pathExists(configFile)) {
    const secretKey = (0, import_nostr_tools.generateSecretKey)();
    const publicKey = (0, import_nostr_tools.getPublicKey)(secretKey);
    const defaultConfig = {
      nsec: import_nostr_tools.nip19.nsecEncode(secretKey),
      npub: import_nostr_tools.nip19.npubEncode(publicKey),
      readRelays: ["wss://relay.damus.io"],
      writeRelays: ["wss://relay.damus.io"]
    };
    await fs.ensureDir(configDir);
    await fs.writeJson(configFile, defaultConfig, { spaces: 2 });
  }
  const config = await fs.readJson(configFile);
  console.log(JSON.stringify(config, null, 2));
  return config;
}
async function getConfig() {
  try {
    const config = await fs.readJson(configFile);
    return config;
  } catch (err) {
    return void 0;
  }
}
async function getSecretKeyUint8Arr() {
  const config = await getConfig();
  if (!config) {
    return void 0;
  }
  const secretKey = import_nostr_tools.nip19.decode(config.nsec).data;
  if (!secretKey) {
    return void 0;
  }
  return secretKey;
}
async function getWriteRelays() {
  const config = await getConfig();
  if (!config) {
    return void 0;
  }
  return config.writeRelays;
}

// src/lib/note.ts
var import_nostr_tools2 = require("nostr-tools");
async function sendNote(plugin2, pool2, content, tags = [], notify = true) {
  const secretKey = await getSecretKeyUint8Arr();
  if (!secretKey) {
    return;
  }
  const writeRelays = await getWriteRelays();
  if (!writeRelays) {
    return;
  }
  let event = (0, import_nostr_tools2.finalizeEvent)(
    {
      kind: 1,
      created_at: Math.floor(Date.now() / 1e3),
      tags,
      content
    },
    secretKey
  );
  await Promise.any(pool2.publish(writeRelays, event));
  if (notify) {
    plugin2.nvim.command(
      `lua vim.notify('Published note: ${event.content}', 'info')`
    );
  }
}

// src/index.ts
(0, import_pool.useWebSocketImplementation)(import_ws.default);
var pool = new import_pool.SimplePool();
var plugin = (plugin2) => {
  plugin2.setOptions({ dev: true });
  plugin2.registerFunction("NostrGenerateConfig", async () => {
    generateConfig();
  });
  plugin2.registerCommand("NostrGenerateConfig", async () => {
    generateConfig();
  });
  plugin2.registerFunction("NostrSendNote", async (content) => {
    sendNote(plugin2, pool, content);
  });
  plugin2.registerCommand(
    "NostrSendNote",
    async (args) => {
      sendNote(plugin2, pool, args[0]);
    },
    {
      sync: false,
      nargs: "*"
    }
  );
  plugin2.registerCommand("ListenForNotes", async () => {
  });
};
var src_default = plugin;
