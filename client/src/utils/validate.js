export const rules = {
  required: (v) => (!v && v !== 0) || !String(v).trim() ? 'This field is required' : null,
  minLength: (n) => (v) => v && v.length < n ? `Minimum ${n} characters` : null,
  maxLength: (n) => (v) => v && v.length > n ? `Maximum ${n} characters` : null,
  min: (n) => (v) => Number(v) < n ? `Must be at least ${n}` : null,
  max: (n) => (v) => Number(v) > n ? `Must be at most ${n}` : null,
  email: (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Invalid email address' : null,
  integer: (v) => v !== '' && !Number.isInteger(Number(v)) ? 'Must be a whole number' : null,
  positiveNumber: (v) => v !== '' && Number(v) < 0 ? 'Must be a positive number' : null,
  maxDecimals: (n) => (v) => {
    const parts = String(v).split('.');
    return parts[1]?.length > n ? `Max ${n} decimal places` : null;
  },
};

const validate = (schema) => (data) => {
  const errors = {};
  Object.entries(schema).forEach(([field, fieldRules]) => {
    for (const rule of fieldRules) {
      const error = rule(data[field]);
      if (error) { errors[field] = error; break; }
    }
  });
  return Object.keys(errors).length ? errors : null;
};

export default validate;
