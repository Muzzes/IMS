const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', subtitle }) => {
  const styleMap = {
    primary:   { bg: 'rgba(129,140,248,0.12)', icon: '#a5b4fc' },
    green:     { bg: 'rgba(110,231,183,0.10)', icon: '#6ee7b7' },
    blue:      { bg: 'var(--info-bg)',         icon: 'var(--info-text)' },
    amber:     { bg: 'rgba(251,191,36,0.10)',  icon: '#fbbf24' },
    rose:      { bg: 'rgba(252,165,165,0.10)', icon: '#fca5a5' },
    purple:    { bg: 'rgba(129,140,248,0.12)', icon: '#818cf8' }
  };
  const theme = styleMap[color] || styleMap.primary;

  return (
    <div className="card-interactive p-5 group rounded-[12px]" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-faint)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110" 
             style={{ width: '36px', height: '36px', borderRadius: '10px', background: theme.bg }}>
          {Icon && <Icon className="w-5 h-5" style={{ color: theme.icon }} />}
        </div>
        {trend !== undefined && (
          <span className="px-2 py-0.5 rounded-full font-semibold"
                style={{
                  fontSize: '11px',
                  background: trend >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: trend >= 0 ? 'var(--success-text)' : 'var(--danger-text)',
                  border: `1px solid ${trend >= 0 ? 'var(--success-border)' : 'var(--danger-border)'}`
                }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)', fontSize: '24px' }}>{value}</p>
      <p className="uppercase font-medium" style={{ color: 'var(--text-tertiary)', fontSize: '11px', letterSpacing: '0.6px' }}>{title}</p>
      {subtitle && <p className="mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{subtitle}</p>}
    </div>
  );
};

export default StatCard;
