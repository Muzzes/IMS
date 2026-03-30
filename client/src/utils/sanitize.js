import DOMPurify from 'dompurify';

export const sanitize = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b|--|;|\/\*|\*\/)/gi;

export const containsSQLInjection = (value) => sqlInjectionPattern.test(String(value));

export const blockInvalidNumberChars = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};
