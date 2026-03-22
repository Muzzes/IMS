const Badge = ({ variant = 'default', children }) => {
  const variants = {
    default: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};

export const statusBadgeVariant = (status) => {
  const map = {
    completed: 'success', paid: 'success', received: 'success', active: 'success',
    pending: 'warning', ordered: 'warning', draft: 'default', partially_paid: 'info',
    overdue: 'danger', cancelled: 'danger', refunded: 'danger',
    full: 'primary', read_only: 'info'
  };
  return map[status] || 'default';
};

export default Badge;
