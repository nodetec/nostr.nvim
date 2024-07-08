import * as fs from "fs-extra";
import * as path from "path";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { Config } from "../types";

const configDir = path.join(process.env.HOME || "", ".config", "nostr.nvim");
const configFile = path.join(configDir, "config.json");

export async function generateConfig() {
  // check if config file exists
  if (!(await fs.pathExists(configFile))) {
    const secretKey = generateSecretKey();
    const publicKey = getPublicKey(secretKey);

    const defaultConfig: Config = {
      nsec: nip19.nsecEncode(secretKey),
      npub: nip19.npubEncode(publicKey),
      readRelays: ["wss://relay.damus.io"],
      writeRelays: ["wss://relay.damus.io"],
    };

    // Create config directory if it doesn't exist
    await fs.ensureDir(configDir);

    // Write default config to the JSON file
    await fs.writeJson(configFile, defaultConfig, { spaces: 2 });
  }

  const config = (await fs.readJson(configFile)) as Config;

  console.log(JSON.stringify(config, null, 2));

  return config;
}

export async function getConfig() {
  try {
    const config = (await fs.readJson(configFile)) as Config;
    return config;
  } catch (err) {
    return undefined;
  }
}

export async function getNsec() {
  const config = await getConfig();
  if (!config) {
    return undefined;
  }
  return config.nsec;
}

export async function getNpub() {
  const config = await getConfig();

  if (!config) {
    return undefined;
  }
  return config.npub;
}

export async function getSecretKeyUint8Arr() {
  const config = await getConfig();

  if (!config) {
    return undefined;
  }

  const secretKey = nip19.decode(config.nsec).data as Uint8Array;

  if (!secretKey) {
    return undefined;
  }

  return secretKey;
}

export async function getPublicKeyHex() {
  const config = await getConfig();

  if (!config) {
    return undefined;
  }

  const publicKey = nip19.decode(config.npub).data as string;

  if (!publicKey) {
    return undefined;
  }

  return publicKey;
}

export async function getWriteRelays() {
  const config = await getConfig();

  if (!config) {
    return undefined;
  }

  return config.writeRelays;
}
