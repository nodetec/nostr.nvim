// node_modules/@noble/hashes/esm/cryptoNode.js
import * as nc from "crypto";
var crypto = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : void 0;

// node_modules/@noble/hashes/esm/utils.js
var u8a = (a) => a instanceof Uint8Array;
var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!isLE)
  throw new Error("Non little-endian hardware is not supported");
var hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  if (!u8a(bytes))
    throw new Error("Uint8Array expected");
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  const len = hex.length;
  if (len % 2)
    throw new Error("padded hex string expected, got unpadded hex of length " + len);
  const array = new Uint8Array(len / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0)
      throw new Error("Invalid byte sequence");
    array[i] = byte;
  }
  return array;
}

export {
  bytesToHex,
  hexToBytes
};
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
