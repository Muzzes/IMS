export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-3' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-[var(--border-subtle)] border-t-[var(--accent-bright)] rounded-full animate-spin`} />
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-4">
      <div className="relative w-12 h-12 mx-auto">
        <div className="absolute inset-0 border-4 border-[var(--border-subtle)] rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[var(--accent-bright)] rounded-full animate-spin border-t-transparent border-l-transparent"></div>
        <div className="absolute inset-3 bg-[var(--accent-glow)] rounded-full animate-pulse"></div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-bright)] animate-pulse">Establishing Connection...</p>
    </div>
  </div>
);

export default LoadingSpinner;
