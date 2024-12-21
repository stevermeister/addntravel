import React, { useState, useEffect, useMemo } from 'react';
import DestinationCard from '../components/DestinationCard';
import DestinationForm from '../components/DestinationForm';
import FilterSortControls from '../components/FilterSortControls';
import destinationsData from '../data/destinations.json';

const Wishlist = () => {
  // State for destinations and form visibility
  const [destinations, setDestinations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Sort states
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    // In the future, this will be replaced with IndexedDB
    setDestinations(destinationsData.destinations.map(dest => ({
      ...dest,
      dateAdded: new Date().toISOString() // Add dateAdded field for sorting
    })));
  }, []);

  // Compute all available seasons and types
  const allSeasons = useMemo(() => 
    [...new Set(destinations.map(dest => dest.preferredSeason))],
    [destinations]
  );

  const allTypes = useMemo(() => 
    [...new Set(destinations.flatMap(dest => dest.tags))],
    [destinations]
  );

  // Handle destination operations
  const handleAddDestination = (newDestination) => {
    const destinationWithDate = {
      ...newDestination,
      dateAdded: new Date().toISOString()
    };
    setDestinations(prev => [...prev, destinationWithDate]);
    setShowAddForm(false);
  };

  const handleDeleteDestination = (destinationId) => {
    setDestinations(prev => prev.filter(dest => dest.id !== destinationId));
  };

  const handleEditDestination = (destinationId) => {
    // To be implemented in the next iteration
    console.log('Edit destination:', destinationId);
  };

  // Filter and sort destinations
  const filteredAndSortedDestinations = useMemo(() => {
    // First, apply filters
    let filtered = destinations.filter(dest => {
      const matchesSearch = (
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesSeason = !selectedSeason || dest.preferredSeason === selectedSeason;
      
      const matchesTypes = selectedTypes.length === 0 || 
        dest.tags.some(tag => selectedTypes.includes(tag));

      return matchesSearch && matchesSeason && matchesTypes;
    });

    // Then, sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortCriteria) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'estimatedBudget':
          comparison = a.estimatedBudget - b.estimatedBudget;
          break;
        case 'daysRequired':
          // Convert "7-10" format to average number for sorting
          const getAverageDays = (days) => {
            const [min, max] = days.split('-').map(Number);
            return max ? (min + max) / 2 : min;
          };
          comparison = getAverageDays(a.daysRequired) - getAverageDays(b.daysRequired);
          break;
        case 'dateAdded':
          comparison = new Date(a.dateAdded) - new Date(b.dateAdded);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [
    destinations,
    searchQuery,
    selectedSeason,
    selectedTypes,
    sortCriteria,
    sortDirection
  ]);

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

      {/* Filter and Sort Controls */}
      <FilterSortControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        sortCriteria={sortCriteria}
        setSortCriteria={setSortCriteria}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        allSeasons={allSeasons}
        allTypes={allTypes}
      />

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredAndSortedDestinations.length} destination{filteredAndSortedDestinations.length !== 1 ? 's' : ''}
          {(selectedTypes.length > 0 || selectedSeason || searchQuery) && ' matching your filters'}
        </p>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedDestinations.map(destination => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            onDelete={handleDeleteDestination}
            onEdit={() => handleEditDestination(destination.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedDestinations.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedSeason || selectedTypes.length > 0
              ? 'Try adjusting your filters or search criteria'
              : 'Add your first destination to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
