const crypto = require("crypto");

function validateRelay(url) {
  const wsRegex = /^(wss?):\/\/[^\s$.?#].[^\s]*$/;
  return wsRegex.test(url);
}

function findFirstH1Header(inputStr) {
  const lines = inputStr.split("\n");
  const h1Header = lines.find((line) => line.startsWith("# "));
  return h1Header ? h1Header.slice(2) : null;
}

function removeFirstH1Header(inputStr) {
  const lines = inputStr.split("\n");
  const h1Index = lines.findIndex(line => line.startsWith("# "));
  if (h1Index !== -1) {
    lines.splice(h1Index, 1);
  }
  return lines.join("\n");
}

function generateUniqueHash(data, length) {
  const sha256 = crypto.createHash("sha256");
  sha256.update(data);
  return sha256.digest("hex").substring(0, length);
}

function createUrlSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
}

function createUniqueUrl(title) {
  const titleSlug = createUrlSlug(title);
  const uniqueHash = generateUniqueHash(title + Date.now().toString(), 12);
  return `${titleSlug}-${uniqueHash}`;
}

module.exports = { validateRelay, findFirstH1Header, removeFirstH1Header, createUniqueUrl };
