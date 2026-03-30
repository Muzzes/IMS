export const statusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'received':
    case 'delivered':
      return 'success';
    case 'pending':
    case 'processing':
    case 'delivering':
      return 'warning';
    case 'cancelled':
    case 'failed':
    case 'refunded':
      return 'danger';
    default:
      return 'neutral';
  }
};

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span className={`badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
