import React, { useState, useEffect, useMemo } from 'react';
import DestinationCard from '../components/DestinationCard';
import DestinationForm from '../components/DestinationForm';
import FilterSortControls from '../components/FilterSortControls';
import TravelCalendar from '../components/TravelCalendar';
import db from '../utils/wishlistDB';
import destinationsData from '../data/destinations.json';

const Wishlist = () => {
  // State for destinations and form visibility
  const [destinations, setDestinations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Sort states
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Load initial data
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check database health and initialize if needed
        const isHealthy = await db.isDatabaseHealthy();
        if (!isHealthy) {
          await db.initialize();
        }

        // Load destinations
        const destinations = await db.getAllDestinations();
        setDestinations(destinations);
      } catch (err) {
        console.error('Error loading destinations:', err);
        setError('Failed to load destinations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDestinations();
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
  const handleAddDestination = async (newDestination) => {
    try {
      const id = await db.addDestination(newDestination);
      const addedDestination = await db.destinations.get(id);
      setDestinations(prev => [...prev, addedDestination]);
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding destination:', err);
      setError('Failed to add destination. Please try again.');
    }
  };

  const handleDeleteDestination = async (destinationId) => {
    try {
      await db.deleteDestination(destinationId);
      setDestinations(prev => prev.filter(dest => dest.id !== destinationId));
    } catch (err) {
      console.error('Error deleting destination:', err);
      setError('Failed to delete destination. Please try again.');
    }
  };

  const handleEditDestination = async (destinationId, updates) => {
    try {
      await db.updateDestination(destinationId, updates);
      setDestinations(prev => prev.map(dest =>
        dest.id === destinationId ? { ...dest, ...updates } : dest
      ));
    } catch (err) {
      console.error('Error updating destination:', err);
      setError('Failed to update destination. Please try again.');
    }
  };

  // Handle date range selection
  const handleDateRangeChange = ({ startDate, endDate, availableDays }) => {
    setSelectedDateRange({ startDate, endDate, availableDays });
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

      // Filter by available days if date range is selected
      const matchesDuration = !selectedDateRange || (() => {
        const [minDays, maxDays] = dest.daysRequired.split('-').map(Number);
        return selectedDateRange.availableDays >= minDays && 
               (!maxDays || selectedDateRange.availableDays <= maxDays);
      })();

      return matchesSearch && matchesSeason && matchesTypes && matchesDuration;
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
    selectedDateRange,
    sortCriteria,
    sortDirection
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

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
        <div className="flex gap-4">
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                await db.resetToDefaults();
                const destinations = await db.getAllDestinations();
                setDestinations(destinations);
              } catch (err) {
                setError('Failed to reset destinations');
              } finally {
                setIsLoading(false);
              }
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
          >
            Reset to Defaults
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300"
          >
            Add Destination
          </button>
        </div>
      </div>

      {/* Travel Calendar */}
      <TravelCalendar onDateRangeChange={handleDateRangeChange} />

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

      {/* Results Count with Date Range Info */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredAndSortedDestinations.length} destination{filteredAndSortedDestinations.length !== 1 ? 's' : ''}
          {selectedDateRange && ` for ${selectedDateRange.availableDays} days of travel`}
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
