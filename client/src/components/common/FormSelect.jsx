const FormSelect = ({
  name,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  placeholder = '-- Select --',
  className = '',
}) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm outline-none transition rounded-[10px] focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={error ? { borderColor: 'var(--danger-text)' } : {}}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default FormSelect;
