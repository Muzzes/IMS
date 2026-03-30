const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', subtitle }) => {
  const styleMap = {
    primary:   { border: 'var(--border-accent)', text: 'var(--text-accent)' },
    green:     { border: 'rgba(16, 185, 129, 0.3)', text: 'var(--success-text)' },
    amber:     { border: 'rgba(245, 158, 11, 0.3)', text: 'var(--warning-text)' },
    rose:      { border: 'rgba(239, 68, 68, 0.3)', text: 'var(--danger-text)' },
    blue:      { border: 'rgba(59, 130, 246, 0.3)', text: 'var(--info-text)' },
    purple:    { border: 'rgba(139, 92, 246, 0.3)', text: '#8b5cf6' }
  };
  const theme = styleMap[color] || styleMap.primary;

  return (
    <div className="card-interactive px-6 py-5 group rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderTop: `2px solid ${theme.border}` }}>
      
      <div className="flex items-start justify-between mb-4">
        <h3 className="uppercase font-bold tracking-wider" style={{ color: 'var(--text-tertiary)', fontSize: '11px', letterSpacing: '1px' }}>
          {title}
        </h3>
        {Icon && (
          <div className="p-1 rounded opacity-50 transition-opacity group-hover:opacity-100" style={{ background: 'var(--bg-subtle)' }}>
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: theme.text }} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <p className="font-bold tracking-tight leading-none" style={{ color: 'var(--text-primary)', fontSize: '28px' }}>
          {value}
        </p>
        
        {trend !== undefined && (
          <span className="px-2 py-0.5 font-bold rounded flex items-center gap-1"
                style={{
                  fontSize: '11px',
                  background: trend >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: trend >= 0 ? 'var(--success-text)' : 'var(--danger-text)',
                }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
        {subtitle && (
          <span className="px-2 py-0.5 font-bold rounded flex items-center gap-1"
                style={{
                  fontSize: '11px',
                  background: 'var(--bg-muted)',
                  color: 'var(--text-secondary)',
                }}>
            {subtitle}
          </span>
        )}
      </div>
      
    </div>
  );
};

export default StatCard;
