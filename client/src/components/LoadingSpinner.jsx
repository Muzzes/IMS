const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-3 border-surface-200 dark:border-surface-700 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-surface-400 animate-pulse">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;
