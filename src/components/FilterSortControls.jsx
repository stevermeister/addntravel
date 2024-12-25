import React from 'react';

const FilterSortControls = ({
  searchQuery = '',
  setSearchQuery = () => {},
  selectedSeason,
  setSelectedSeason,
  selectedTypes,
  setSelectedTypes,
  sortCriteria,
  setSortCriteria,
  sortDirection,
  setSortDirection
}) => {
  const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const types = ['city', 'beach', 'mountain', 'countryside', 'cultural', 'adventure'];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'estimatedBudget', label: 'Budget' },
    { value: 'min_days', label: 'Duration' }
  ];

  const handleTypeToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Season Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Season</h4>
        <div className="flex flex-wrap gap-2">
          {seasons.map(season => (
            <button
              key={season}
              onClick={() => setSelectedSeason(selectedSeason === season ? '' : season)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedSeason === season
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Type</h4>
        <div className="flex flex-wrap gap-2">
          {types.map(type => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                selectedTypes.includes(type)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Controls */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sort by</h4>
        <div className="flex gap-2">
          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}
            className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSortControls;
