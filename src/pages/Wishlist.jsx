import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DestinationCard from '../components/DestinationCard';
import DestinationForm from '../components/DestinationForm';
import FilterSortControls from '../components/FilterSortControls';
import TravelCalendar from '../components/TravelCalendar';
import AISuggestions from '../components/AISuggestions';
import { getSuggestedDestinations } from '../utils/aiSuggestions';
import db from '../utils/wishlistDB';
import destinationsData from '../data/destinations.json';
import { seedDatabase, initialDestinations } from '../utils/seedData';

const Wishlist = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State for destinations and form visibility
  const [destinations, setDestinations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDestination, setEditingDestination] = useState(null);

  // Helper function to format date to YYYY-MM-DD
  const formatDateForUrl = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Helper function to parse date from URL
  const parseDateFromUrl = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr + 'T00:00:00');
  };

  // Filter states - initialize from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedSeason, setSelectedSeason] = useState(searchParams.get('season') || '');
  const [selectedTypes, setSelectedTypes] = useState(searchParams.get('types')?.split(',').filter(Boolean) || []);
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const startDate = parseDateFromUrl(searchParams.get('start'));
    const endDate = parseDateFromUrl(searchParams.get('end'));
    const availableDays = searchParams.get('days');
    return startDate && endDate ? { 
      startDate, 
      endDate, 
      availableDays: Number(availableDays) 
    } : null;
  });

  // Sort states - initialize from URL params
  const [sortCriteria, setSortCriteria] = useState(searchParams.get('sort') || 'name');
  const [sortDirection, setSortDirection] = useState(searchParams.get('order') || 'asc');

  // AI suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Only add parameters that have values
    if (searchQuery) params.set('q', searchQuery);
    if (selectedSeason) params.set('season', selectedSeason);
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (selectedDateRange) {
      params.set('start', formatDateForUrl(selectedDateRange.startDate));
      params.set('end', formatDateForUrl(selectedDateRange.endDate));
      params.set('days', selectedDateRange.availableDays.toString());
    }
    if (sortCriteria !== 'name') params.set('sort', sortCriteria);
    if (sortDirection !== 'asc') params.set('order', sortDirection);

    // Update URL without causing a page reload
    setSearchParams(params, { replace: true });
  }, [
    searchQuery,
    selectedSeason,
    selectedTypes,
    selectedDateRange,
    sortCriteria,
    sortDirection,
    setSearchParams
  ]);

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

  // Compute valid seasons for selected date range
  const getValidSeasonsForDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return ['winter', 'spring', 'summer', 'autumn'];

    const seasonRanges = {
      winter: [[12, 1, 2]],
      spring: [[3, 4, 5]],
      summer: [[6, 7, 8]],
      autumn: [[9, 10, 11]]
    };

    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = start.getMonth() + 1; // 1-12
    const endMonth = end.getMonth() + 1; // 1-12

    return Object.entries(seasonRanges).filter(([season, ranges]) => {
      return ranges.some(monthRange => {
        // Check if date range overlaps with season months
        const seasonMonths = new Set(monthRange);
        for (let month = startMonth; month !== (endMonth + 1); month = (month % 12) + 1) {
          if (seasonMonths.has(month)) return true;
          if (month === endMonth) break;
        }
        return false;
      });
    }).map(([season]) => season);
  };

  // Get valid seasons based on selected date range
  const validSeasons = useMemo(() => {
    if (!selectedDateRange || !selectedDateRange.startDate) return allSeasons;
    return getValidSeasonsForDateRange(
      selectedDateRange.startDate,
      selectedDateRange.endDate
    );
  }, [selectedDateRange, allSeasons]);

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

  const handleEditDestination = async (destinationId, updates) => {
    try {
      await db.updateDestination(destinationId, updates);
      setDestinations(prev => prev.map(dest =>
        dest.id === destinationId ? { ...dest, ...updates } : dest
      ));
      setEditingDestination(null);
    } catch (err) {
      console.error('Error updating destination:', err);
      setError('Failed to update destination. Please try again.');
    }
  };

  const handleStartEdit = (destination) => {
    setEditingDestination(destination);
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

  // Handle date range selection
  const handleDateRangeChange = ({ startDate, endDate, availableDays }) => {
    setSelectedDateRange({ startDate, endDate, availableDays });
    
    // Get valid seasons for the new date range
    const newValidSeasons = startDate && endDate ? 
      getValidSeasonsForDateRange(startDate, endDate) : 
      ['winter', 'spring', 'summer', 'autumn'];

    // If there's only one valid season, select it automatically
    if (newValidSeasons.length === 1) {
      setSelectedSeason(newValidSeasons[0]);
    } 
    // If current selection is not in new valid seasons, clear it
    else if (selectedSeason && !newValidSeasons.includes(selectedSeason)) {
      setSelectedSeason('');
    }
  };

  // Get AI suggestions based on current filters
  const handleGetSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      
      const preferences = {
        duration: selectedDateRange ? selectedDateRange.availableDays : 7,
        season: selectedSeason || 'winter', // Default to winter instead of 'any'
        types: selectedTypes,
        budget: 3000 // Default budget, could be made configurable
      };

      const newSuggestions = await getSuggestedDestinations(preferences);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setError('Failed to get AI suggestions. Please try again.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Add suggested destination to wishlist
  const handleAddSuggestion = async (suggestion) => {
    try {
      const id = await db.addDestination({
        ...suggestion,
        dateAdded: new Date().toISOString()
      });
      
      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => s !== suggestion));
      
      // Add to destinations
      const addedDestination = await db.destinations.get(id);
      setDestinations(prev => [...prev, addedDestination]);
    } catch (err) {
      console.error('Error adding suggestion:', err);
      setError('Failed to add suggestion to wishlist');
    }
  };

  const handleSeedData = async () => {
    try {
      setIsLoading(true);
      const success = await seedDatabase(initialDestinations);
      if (success) {
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
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort destinations
  const filteredAndSortedDestinations = useMemo(() => {
    // First, apply filters
    let filtered = destinations.filter(dest => {
      const matchesSearch = (
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Check if the destination's season is valid for the selected date range
      const isSeasonValidForDateRange = !selectedDateRange?.startDate || 
        validSeasons.includes(dest.preferredSeason);
      
      // Check if it matches the selected season filter (if any)
      const matchesSeason = !selectedSeason || dest.preferredSeason === selectedSeason;
      
      const matchesTypes = selectedTypes.length === 0 || 
        dest.tags.some(tag => selectedTypes.includes(tag));

      // Filter by available days if date range is selected
      const matchesDuration = !selectedDateRange || (() => {
        const [minDays, maxDays] = dest.daysRequired.split('-').map(Number);
        return selectedDateRange.availableDays >= minDays && 
               (!maxDays || selectedDateRange.availableDays <= maxDays);
      })();

      return matchesSearch && matchesSeason && matchesTypes && 
             matchesDuration && isSeasonValidForDateRange;
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
    sortDirection,
    validSeasons
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
      {(showAddForm || editingDestination) && (
        <DestinationForm
          onSubmit={editingDestination ? 
            (updates) => handleEditDestination(editingDestination.id, updates) : 
            handleAddDestination}
          onClose={() => {
            setShowAddForm(false);
            setEditingDestination(null);
          }}
          initialData={editingDestination}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Travel Wishlist</h1>
        <div className="flex gap-4">
          <button
            onClick={handleGetSuggestions}
            disabled={isLoadingSuggestions}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50"
          >
            {isLoadingSuggestions ? 'Getting Suggestions...' : 'Get AI Suggestions'}
          </button>
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
            onClick={handleSeedData}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Load Sample Data
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

      {/* AI Suggestions */}
      <AISuggestions
        suggestions={suggestions}
        onAddToWishlist={handleAddSuggestion}
        isLoading={isLoadingSuggestions}
      />

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
        allSeasons={validSeasons}
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
            onEdit={handleStartEdit}
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
