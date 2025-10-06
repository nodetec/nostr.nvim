# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

nostr.nvim is a Neovim plugin that connects Neovim to the Nostr protocol (Notes and Other Stuff Transmitted by Relays). The plugin uses Neovim's remote plugin system to integrate TypeScript functionality with Lua plugin code.

## Architecture

This plugin follows Neovim's remote plugin architecture pattern:

- **Lua entry point** (`lua/nostr/init.lua`): Registers the plugin and provides the Lua API that Neovim users interact with
- **TypeScript remote plugin** (`src/`): Contains the actual implementation using nostr-tools, communicates with Neovim via the remote plugin interface
- **Compiled output** (`rplugin/node/nostr/`): The built JavaScript that Neovim executes as a Node.js remote plugin

The remote plugin system uses msgpack-rpc to communicate between Neovim and the Node.js process running the TypeScript code.

## Technology Stack

- **nostr-tools**: TypeScript library for interacting with Nostr relays
- **neovim/node-client**: Official Neovim Node.js client for building remote plugins
- **TypeScript**: For type-safe Nostr protocol handling
- **Lua**: For the Neovim plugin interface

## Development Workflow

When this project is fully set up, the typical workflow will be:

1. Make changes to TypeScript source files in `src/`
2. Build the plugin to compile TypeScript → JavaScript in `rplugin/node/nostr/`
3. Run `:UpdateRemotePlugins` in Neovim to register/update plugin commands
4. Restart Neovim to load the updated plugin

## Project Status

This is a fresh project currently in initial setup phase. The basic README has been created but the plugin structure and build system have not yet been implemented.
