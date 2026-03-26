const FormTextarea = ({
  name,
  value,
  onChange,
  rows = 3,
  error,
  placeholder,
  disabled = false,
  maxLength,
  className = '',
}) => {
  return (
    <div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full px-3 py-2 text-sm outline-none transition rounded-[10px] resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={error ? { borderColor: 'var(--danger-text)' } : {}}
      />
      {maxLength && (
        <p className="text-xs mt-0.5 text-right" style={{ color: 'var(--text-muted)' }}>
          {(value || '').length}/{maxLength}
        </p>
      )}
    </div>
  );
};

export default FormTextarea;
