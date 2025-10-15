import { useState } from 'react';
import { Search, X, Filter, Calendar, User, Briefcase, Tag } from 'lucide-react';

const AdvancedSearch = ({
  onSearch,
  filters = [],
  placeholder = "Search...",
  showFilters = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch({ searchTerm: term, filters: activeFilters });
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = {
      ...activeFilters,
      [filterKey]: value
    };
    setActiveFilters(newFilters);
    onSearch({ searchTerm, filters: newFilters });
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onSearch({ searchTerm: '', filters: {} });
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;

  const getFilterIcon = (type) => {
    switch (type) {
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      case 'select':
        return <Tag className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fadeIn">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
            placeholder={placeholder}
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {showFilters && filters.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              isExpanded || activeFilterCount > 0
                ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white text-accent-600 rounded-full text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {(searchTerm || activeFilterCount > 0) && (
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
          >
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && filters.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 animate-slideIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  {getFilterIcon(filter.type)}
                  {filter.label}
                </label>

                {filter.type === 'select' && (
                  <select
                    value={activeFilters[filter.key] || 'all'}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-gray-900"
                  >
                    <option value="all">All {filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-gray-900"
                  />
                )}

                {filter.type === 'daterange' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={activeFilters[`${filter.key}_from`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}_from`, e.target.value)}
                      placeholder="From"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-gray-900"
                    />
                    <input
                      type="date"
                      value={activeFilters[`${filter.key}_to`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}_to`, e.target.value)}
                      placeholder="To"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                )}

                {filter.type === 'text' && (
                  <input
                    type="text"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={`Enter ${filter.label.toLowerCase()}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-gray-900"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([key, value]) => {
                  if (!value || value === 'all') return null;
                  const filter = filters.find(f => f.key === key || key.startsWith(f.key));
                  if (!filter) return null;

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-accent-100 text-accent-800 rounded-full text-sm font-semibold"
                    >
                      {filter.label}: {value}
                      <button
                        onClick={() => handleFilterChange(key, '')}
                        className="hover:bg-accent-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
