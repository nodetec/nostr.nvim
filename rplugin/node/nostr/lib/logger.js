const fs = require('fs');
const os = require('os');
const path = require('path');

const LOG_PATH = path.join(os.homedir(), '.local', 'state', 'nostr.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${msg}`;

  fs.appendFile(LOG_PATH, logMessage + "\n", (err) => {
    if (err) {
      console.error("Error writing to log file: ", err);
    }
  });
}

module.exports = { log };
