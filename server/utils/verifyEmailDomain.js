const dns = require('dns').promises;

const verifyEmailDomain = async (email) => {
  const domain = email.split('@')[1];

  if (!domain) return { valid: false, reason: 'Invalid email format' };

  try {
    const mxRecords = await dns.resolveMx(domain);

    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: 'Email domain has no mail servers' };
    }

    const sorted = mxRecords.sort((a, b) => a.priority - b.priority);

    return {
      valid: true,
      mxRecords: sorted,
      primaryMailServer: sorted[0].exchange,
    };
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return { valid: false, reason: 'Email domain does not exist' };
    }
    // DNS timeout or lookup restrict — fail open
    return { valid: true, reason: 'DNS check skipped' };
  }
};

module.exports = verifyEmailDomain;
