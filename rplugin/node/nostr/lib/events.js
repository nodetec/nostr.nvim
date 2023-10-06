const nostr = require("nostr-tools");
const keys = require("./keys");

function create(kind, tags, content) {
  const keypair = keys.getKeyPair();

  const publicKey = keypair.publicKey;
  const privateKey = keypair.privateKey;

  let event = {
    kind: kind,
    created_at: Math.floor(Date.now() / 1000),
    tags: tags,
    content: content,
    pubkey: publicKey,
  };

  event.id = nostr.getEventHash(event);
  event.sig = nostr.getSignature(event, privateKey);

  return event;
};

module.exports = {
  create,
};
