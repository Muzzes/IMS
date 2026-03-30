// LAYER 1 — Format validation
export const validateEmailFormat = (email) => {
  if (!email) return { valid: false, checks: {}, message: 'Email is required' };

  const checks = {
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    noDots: !(/\.\./).test(email),
    validTLD: /\.[a-zA-Z]{2,}$/.test(email),
    noSpaces: !/\s/.test(email),
    localLength: (email.split('@')[0]?.length ?? 0) <= 64,
    domainLength: (email.split('@')[1]?.length ?? 0) <= 255,
    validChars: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email),
  };

  const passed = Object.values(checks).every(Boolean);
  return {
    valid: passed,
    checks,
    message: passed ? null : getEmailErrorMessage(checks),
  };
};

const getEmailErrorMessage = (checks) => {
  if (!checks.noSpaces) return 'Email address cannot contain spaces';
  if (!checks.format) return 'Please enter a valid email address';
  if (!checks.noDots) return 'Email address cannot contain consecutive dots';
  if (!checks.validTLD) return 'Email must have a valid domain extension (e.g. .com)';
  if (!checks.localLength) return 'The part before @ cannot exceed 64 characters';
  if (!checks.domainLength) return 'The domain part cannot exceed 255 characters';
  if (!checks.validChars) return 'Email contains invalid characters';
  return 'Invalid email format';
};

// LAYER 2 — Disposable domain detection
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'spam4.me', 'trashmail.com', 'trashmail.me',
  'dispostable.com', 'fakeinbox.com', 'spamgourmet.com', 'maildrop.cc',
  'discard.email', 'spamgourmet.net', 'mailnull.com', 'spamhereplease.com',
  'spamspot.com', 'jetable.fr.nf', 'noref.in', 'zetmail.com',
  'spamthisplease.com', 'trashmail.at', 'trashmail.io', 'getnada.com',
  'mailnesia.com', 'mintemail.com', 'tempinbox.com', 'throwam.com',
  'tempr.email', 'dispostable.com', 'temp-mail.org', 'tempail.com',
  'tmpmail.net', 'getairmail.com', 'filzmail.com', 'armyspy.com',
  'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
]);

export const isDisposableEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
};

// Combined validation: run format check then disposable check
export const validateEmail = (email) => {
  const formatResult = validateEmailFormat(email);
  if (!formatResult.valid) return formatResult;

  if (isDisposableEmail(email)) {
    return {
      valid: false,
      checks: formatResult.checks,
      message: 'Temporary or disposable email addresses are not allowed. Please use your real email address.',
    };
  }

  return { valid: true, checks: formatResult.checks, message: null };
};
