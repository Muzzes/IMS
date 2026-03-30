const blacklist = new Map(); // token -> expiry time (ms)
const CLEAUP_INTERVAL = 60 * 60 * 1000; // 1 hour

// Periodically clean up expired tokens from the blacklist
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of blacklist.entries()) {
    if (now > expiry) {
      blacklist.delete(token);
    }
  }
}, CLEAUP_INTERVAL);

const tokenBlacklist = {
  add: (token, expirySecs) => {
    // Determine when the token actually expires
    const expiryMs = expirySecs * 1000;
    blacklist.set(token, expiryMs);
  },
  
  has: (token) => {
    return blacklist.has(token);
  }
};

module.exports = tokenBlacklist;
