const FormField = ({ label, error, required, children, hint }) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
        {label}
        {required && <span style={{ color: 'var(--danger-text)' }}> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--danger-text)' }}>{error}</p>
      )}
    </div>
  );
};

export default FormField;
