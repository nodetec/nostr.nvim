import { NvimPlugin } from "neovim";
import { SimplePool, useWebSocketImplementation } from "nostr-tools/pool";
import WebSocket from "ws";
import { generateConfig } from "./lib/config";
import { sendNote } from "./lib/note";
useWebSocketImplementation(WebSocket);

const pool = new SimplePool();

const plugin = (plugin: NvimPlugin) => {
  plugin.setOptions({ dev: true });

  plugin.registerFunction("NostrGenerateConfig", async () => {
    generateConfig();
  });

  plugin.registerCommand("NostrGenerateConfig", async () => {
    generateConfig();
  });

  plugin.registerFunction("NostrSendNote", async (content: string) => {
    sendNote(plugin, pool, content);
  });

  plugin.registerCommand(
    "NostrSendNote",
    async (args: any) => {
      sendNote(plugin, pool, args[0]);
    },
    {
      sync: false,
      nargs: "1",
    },
  );

  plugin.registerCommand("ListenForNotes", async () => {});
};

export default plugin;
