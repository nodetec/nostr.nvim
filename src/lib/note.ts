import { finalizeEvent, SimplePool } from "nostr-tools";
import { getSecretKeyUint8Arr, getWriteRelays } from "./config";
import { NvimPlugin } from "neovim";

export async function sendNote(
  plugin: NvimPlugin,
  pool: SimplePool,
  content: string,
  tags: string[][] = [],
  notify: boolean = true,
) {
  const secretKey = await getSecretKeyUint8Arr();
  if (!secretKey) {
    return;
  }

  const writeRelays = await getWriteRelays();

  if (!writeRelays) {
    return;
  }

  let event = finalizeEvent(
    {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content,
    },
    secretKey,
  );

  await Promise.any(pool.publish(writeRelays, event));

  if (notify) {
    plugin.nvim.command(
      `lua vim.notify('Published note: ${event.content}', 'info')`,
    );
  }
}
