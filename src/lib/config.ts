import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { NostrConfig, RelayConfig } from "../types/index.js";

const CONFIG_DIR = join(homedir(), ".config", "nostr.nvim");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

/**
 * Migrate old string[] relay format to new RelayConfig[] format
 */
export function migrateRelayConfig(config: NostrConfig): NostrConfig {
  if (!config.relays || config.relays.length === 0) {
    return config;
  }

  // Check if already in new format
  if (typeof config.relays[0] === "object" && "url" in config.relays[0]) {
    return config;
  }

  // Migrate from old format (string[]) to new format (RelayConfig[])
  const migratedRelays: RelayConfig[] = (config.relays as string[]).map(
    (url) => ({
      url,
      read: true,
      write: true,
    }),
  );

  return {
    ...config,
    relays: migratedRelays,
  };
}

/**
 * Get relay URLs configured for reading
 */
export function getReadRelays(config: NostrConfig): string[] {
  if (!config.relays || config.relays.length === 0) {
    return [];
  }

  // Handle old format
  if (typeof config.relays[0] === "string") {
    return config.relays as string[];
  }

  // Handle new format
  return (config.relays as RelayConfig[])
    .filter((r) => r.read)
    .map((r) => r.url);
}

/**
 * Get relay URLs configured for writing
 */
export function getWriteRelays(config: NostrConfig): string[] {
  if (!config.relays || config.relays.length === 0) {
    return [];
  }

  // Handle old format
  if (typeof config.relays[0] === "string") {
    return config.relays as string[];
  }

  // Handle new format
  return (config.relays as RelayConfig[])
    .filter((r) => r.write)
    .map((r) => r.url);
}

export async function loadConfig(): Promise<NostrConfig> {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return {};
    }
    const data = await readFile(CONFIG_FILE, "utf-8");
    const config = JSON.parse(data);

    // Automatically migrate old format to new format
    return migrateRelayConfig(config);
  } catch (error) {
    console.error(`Failed to load config: ${error}`);
    return {};
  }
}

export async function saveConfig(config: NostrConfig): Promise<void> {
  try {
    if (!existsSync(CONFIG_DIR)) {
      await mkdir(CONFIG_DIR, { recursive: true });
    }
    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    throw new Error(`Failed to save config: ${error}`);
  }
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
