const SkeletonCard = ({ className = '', lines = 3 }) => {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className} animate-fadeIn`}>
      <div className="skeleton h-6 w-32 rounded mb-4"></div>
      {[...Array(lines)].map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded mb-2 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}></div>
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-4 border-b border-gray-200">
        <div className="skeleton h-6 w-48 rounded"></div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="skeleton h-10 w-10 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/3 rounded"></div>
            <div className="skeleton h-3 w-1/2 rounded"></div>
          </div>
          <div className="skeleton h-8 w-24 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton h-4 w-24 rounded"></div>
            <div className="skeleton h-10 w-10 rounded-full"></div>
          </div>
          <div className="skeleton h-8 w-20 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;
