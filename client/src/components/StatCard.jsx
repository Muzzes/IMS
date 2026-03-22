const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', subtitle }) => {
  const colorMap = {
    primary: 'from-primary-500 to-primary-600',
    green: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg shadow-${color}-500/20
                        group-hover:scale-110 transition-transform duration-300`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
            ${trend >= 0 ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30'
                         : 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-white mb-0.5">{value}</p>
      <p className="text-sm text-surface-500 dark:text-surface-400">{title}</p>
      {subtitle && <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
