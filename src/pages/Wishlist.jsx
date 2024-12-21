import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, remove, set } from 'firebase/database';
import { database, auth } from '../utils/firebase';
import DestinationCard from '../components/DestinationCard';
import DestinationForm from '../components/DestinationForm';
import FilterSortControls from '../components/FilterSortControls';
import TravelCalendar from '../components/TravelCalendar';
import AISuggestions from '../components/AISuggestions';

const Wishlist = () => {
  const [destinations, setDestinations] = useState([]);
  const [newDestination, setNewDestination] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const destinationsRef = ref(database, `users/${userId}/destinations`);
    const unsubscribe = onValue(destinationsRef, (snapshot) => {
      const data = snapshot.val();
      const destinationsList = data ? Object.entries(data).map(([id, dest]) => ({
        id,
        name: dest.name,
        description: dest.description,
        preferredSeason: dest.preferredSeason,
        tags: dest.tags || [],
        daysRequired: dest.daysRequired || '',
        estimatedBudget: dest.estimatedBudget || 0,
        dateAdded: dest.dateAdded || new Date().toISOString()
      })) : [];
      setDestinations(destinationsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddDestination = async (newDest) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const destinationsRef = ref(database, `users/${userId}/destinations`);
      await push(destinationsRef, {
        ...newDest,
        dateAdded: new Date().toISOString()
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding destination:', error);
    }
  };

  const handleEditDestination = async (destinationId, updates) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const destinationRef = ref(database, `users/${userId}/destinations/${destinationId}`);
      await set(destinationRef, {
        ...updates,
        dateAdded: updates.dateAdded || new Date().toISOString()
      });
      setEditingDestination(null);
    } catch (error) {
      console.error('Error updating destination:', error);
    }
  };

  const handleDeleteDestination = async (destinationId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const destinationRef = ref(database, `users/${userId}/destinations/${destinationId}`);
      await remove(destinationRef);
    } catch (error) {
      console.error('Error removing destination:', error);
    }
  };

  const handleGetSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      
      const preferences = {
        duration: selectedDateRange ? selectedDateRange.availableDays : 7,
        season: selectedSeason || 'winter',
        types: selectedTypes,
        budget: 3000
      };

      // TODO: Implement actual AI suggestions
      const mockSuggestions = [
        { name: "Paris", description: "City of Light", preferredSeason: "spring", tags: ["city", "culture"], daysRequired: "3-5", estimatedBudget: 2000 },
        { name: "Barcelona", description: "Vibrant coastal city", preferredSeason: "summer", tags: ["city", "beach"], daysRequired: "4-6", estimatedBudget: 1800 }
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleDateRangeChange = ({ startDate, endDate, availableDays }) => {
    setSelectedDateRange({ startDate, endDate, availableDays });
  };

  const filteredAndSortedDestinations = useMemo(() => {
    // First, apply filters
    let filtered = destinations.filter(dest => {
      const matchesSearch = !searchQuery || (
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dest.description && dest.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      const matchesSeason = !selectedSeason || dest.preferredSeason === selectedSeason;
      
      const matchesTypes = selectedTypes.length === 0 || 
        (dest.tags && dest.tags.some(tag => selectedTypes.includes(tag)));

      const matchesDuration = !selectedDateRange || (() => {
        if (!dest.daysRequired) return true;
        const [minDays, maxDays] = dest.daysRequired.split('-').map(Number);
        return selectedDateRange.availableDays >= minDays && 
               (!maxDays || selectedDateRange.availableDays <= maxDays);
      })();

      return matchesSearch && matchesSeason && matchesTypes && matchesDuration;
    });

    // Then, sort the filtered results
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortCriteria) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'estimatedBudget':
          comparison = (a.estimatedBudget || 0) - (b.estimatedBudget || 0);
          break;
        case 'daysRequired':
          const getAverageDays = (days) => {
            if (!days) return 0;
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
  }, [
    destinations,
    searchQuery,
    selectedSeason,
    selectedTypes,
    selectedDateRange,
    sortCriteria,
    sortDirection
  ]);

  const allSeasons = ['winter', 'spring', 'summer', 'autumn'];
  const allTypes = ['city', 'beach', 'mountain', 'countryside', 'cultural', 'adventure'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
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
      {suggestions.length > 0 && (
        <AISuggestions
          suggestions={suggestions}
          onAddToWishlist={handleAddDestination}
          isLoading={isLoadingSuggestions}
        />
      )}

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
          {selectedDateRange && ` for ${selectedDateRange.availableDays} days of travel`}
          {(selectedTypes.length > 0 || selectedSeason || searchQuery) && ' matching your filters'}
        </p>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDestinations.map(destination => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onDelete={handleDeleteDestination}
                onEdit={() => setEditingDestination(destination)}
              />
            ))}
          </div>

          {filteredAndSortedDestinations.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedSeason || selectedTypes.length > 0
                  ? "Try adjusting your filters or search criteria"
                  : "Add your first destination to get started"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Form Modal */}
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
          allSeasons={allSeasons}
          allTypes={allTypes}
        />
      )}
    </div>
  );
};

export default Wishlist;
