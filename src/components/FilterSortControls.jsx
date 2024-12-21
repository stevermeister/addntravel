import React from 'react';

const FilterSortControls = ({
  searchQuery,
  setSearchQuery,
  selectedSeason,
  setSelectedSeason,
  selectedTypes,
  setSelectedTypes,
  sortCriteria,
  setSortCriteria,
  sortDirection,
  setSortDirection,
  allSeasons,
  allTypes
}) => {
  const handleTypeToggle = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Clear season selection if it becomes invalid
  React.useEffect(() => {
    if (selectedSeason && !allSeasons.includes(selectedSeason)) {
      setSelectedSeason('');
    }
  }, [allSeasons, selectedSeason, setSelectedSeason]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Destinations
          </label>
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Season Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Season
          </label>
          <select
            value={selectedSeason === null ? "" : selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Seasons</option>
            {allSeasons.map(season => (
              <option key={season} value={season} className="capitalize">
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </option>
            ))}
          </select>
          {selectedSeason && !allSeasons.includes(selectedSeason) && (
            <p className="mt-1 text-sm text-red-600">
              This season is not available for the selected dates
            </p>
          )}
        </div>

        {/* Sort Criteria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <div className="flex space-x-2">
            <select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="estimatedBudget">Budget</option>
              <option value="daysRequired">Days</option>
              <option value="dateAdded">Date Added</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Destination Types */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destination Types
        </label>
        <div className="flex flex-wrap gap-2">
          {allTypes.map(type => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                selectedTypes.includes(type)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="mt-4 flex flex-wrap gap-2">
        {selectedTypes.length > 0 && (
          <div className="text-sm text-gray-600">
            Active filters: {selectedTypes.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSortControls;
