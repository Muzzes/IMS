const FormInput = ({
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled = false,
  prefix,
  suffix,
  min,
  max,
  step,
  className = '',
  ...rest
}) => {
  const inputStyle = error ? { borderColor: 'var(--danger-text)' } : {};
  const input = (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className={`w-full px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} ${className}`}
      style={inputStyle}
      {...rest}
    />
  );

  if (!prefix && !suffix) return input;

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>
          {prefix}
        </span>
      )}
      {input}
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>
          {suffix}
        </span>
      )}
    </div>
  );
};

export default FormInput;
