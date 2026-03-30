const { validationResult } = require('express-validator');

// Regex to catch basic SQL injection patterns
const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b|--|;|\/\*|\*\/)/i;

const detectSQLi = (obj) => {
  if (!obj) return false;
  for (const key in obj) {
    if (typeof obj[key] === 'string' && sqlInjectionPattern.test(obj[key])) {
      return true;
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (detectSQLi(obj[key])) return true;
    }
  }
  return false;
};

const blockSQLInjection = (req, res, next) => {
  if (detectSQLi(req.body) || detectSQLi(req.query) || detectSQLi(req.params)) {
    console.error(`[SECURITY] SQL Injection attempt detected from IP: ${req.ip}`);
    return res.status(400).json({ message: 'Invalid input characters detected in payload. Action blocked.' });
  }
  next();
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validate,
  blockSQLInjection
};
