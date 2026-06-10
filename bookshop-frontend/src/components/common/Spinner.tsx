export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-[3px]',
  };
  return (
    <div className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizes[size]}`} role="status" aria-label="Loading" />
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Spinner size="lg" />
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  );
}
