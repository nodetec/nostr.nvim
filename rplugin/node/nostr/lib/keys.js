const { generatePrivateKey, getPublicKey } = require('nostr-tools');
const fs = require('fs');
const os = require('os');
const path = require('path');
const logger = require('./logger');

const KEY_PATH = path.join(os.homedir(), '.config', 'nostr.nvim', 'keys.json');

const generateKeyPair = () => {

  // If the key pair does not exist, generate a new one
  const privateKey = generatePrivateKey();
  const publicKey = getPublicKey(privateKey);

  // Write the generated keys to the file
  const keys = { privateKey, publicKey };

  try {
    fs.mkdirSync(path.dirname(KEY_PATH), { recursive: true });
    fs.writeFileSync(KEY_PATH, JSON.stringify(keys, null, 2));
    logger.log('Key pair generated');
    plugin.nvim.outWrite("Key pair generated\n");
  } catch (err) {
    logger.log("error: " + err);
  }
  return keys;
}


const getKeyPair = () => {
  logger.log('Generating new key pair');
  if (fs.existsSync(KEY_PATH)) {
    logger.log('Key pair already exists');
    // If the key pair already exists, read it from the file
    const keys = JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8'));
    return keys;
  } else {
    logger.log('Key pair does not exist');
    return generateKeyPair();
  }
};

module.exports = { generateKeyPair, getKeyPair };

