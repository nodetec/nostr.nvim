function validateRelay(url) {
  const wsRegex = /^(wss?):\/\/[^\s$.?#].[^\s]*$/;
  return wsRegex.test(url);
}

module.exports = { validateRelay };
