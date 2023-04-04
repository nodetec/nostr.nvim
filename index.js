const { NeovimClient } = require('neovim');

async function main() {
  // Create a new Neovim client instance
  const nvim = await NeovimClient.attach({ proc: process });

  // Register a new command called 'HelloWorld'
  nvim.command('command! HelloWorld echo "Hello, World!"');

  // Log a message to indicate the plugin is ready
  console.log('My NeoVim plugin is ready!');
}

main().catch(console.error);
