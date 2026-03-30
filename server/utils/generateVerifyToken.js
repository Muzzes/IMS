const crypto = require('crypto');

const generateVerifyToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = generateVerifyToken;
