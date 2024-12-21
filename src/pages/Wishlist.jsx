import React, { useState, useEffect } from 'react';
import DestinationCard from '../components/DestinationCard';
import DestinationForm from '../components/DestinationForm';
import destinationsData from '../data/destinations.json';

const Wishlist = () => {
  const [destinations, setDestinations] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // In the future, this will be replaced with IndexedDB
    setDestinations(destinationsData.destinations);
  }, []);

  const handleAddDestination = (newDestination) => {
    setDestinations(prev => [...prev, newDestination]);
    setShowAddForm(false);
  };

  const handleDeleteDestination = (destinationId) => {
    setDestinations(prev => prev.filter(dest => dest.id !== destinationId));
  };

  const handleEditDestination = (destinationId) => {
    // To be implemented in the next iteration
    console.log('Edit destination:', destinationId);
  };

  const allTags = [...new Set(destinations.flatMap(dest => dest.tags))];
  const allSeasons = [...new Set(destinations.map(dest => dest.preferredSeason))];

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || dest.tags.some(tag => selectedTags.includes(tag));
    const matchesSeason = !selectedSeason || dest.preferredSeason === selectedSeason;
    
    return matchesSearch && matchesTags && matchesSeason;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {showAddForm && (
        <DestinationForm
          onSubmit={handleAddDestination}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Travel Wishlist</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300"
        >
          Add Destination
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Filter by Season
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Seasons</option>
              {allSeasons.map(season => (
                <option key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map(destination => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            onDelete={handleDeleteDestination}
            onEdit={() => handleEditDestination(destination.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredDestinations.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
