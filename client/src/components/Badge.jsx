const Badge = ({ variant = 'default', children }) => {
  const variants = {
    default: 'badge-neutral',
    neutral: 'badge-neutral',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    primary: 'badge-accent'
  };

  return (
    <span className={`inline-flex items-center ${variants[variant]} transition`}>
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
