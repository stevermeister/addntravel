import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, remove, set } from 'firebase/database';
import { database, auth } from '../utils/firebase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { parseDatePeriod } from '../utils/dateParser';
import DestinationCard from '../components/DestinationCard';
import DestinationForm from '../components/DestinationForm';
import FilterSortControls from '../components/FilterSortControls';
import TravelCalendar from '../components/TravelCalendar';
import AISuggestions from '../components/AISuggestions';

const Wishlist = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [newDestination, setNewDestination] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSeason, setSelectedSeason] = useState(searchParams.get('season') || '');
  const [selectedTypes, setSelectedTypes] = useState(searchParams.get('types')?.split(',').filter(Boolean) || []);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [sortCriteria, setSortCriteria] = useState(searchParams.get('sort') || 'name');
  const [sortDirection, setSortDirection] = useState(searchParams.get('order') || 'asc');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedSeason) params.set('season', selectedSeason);
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (sortCriteria !== 'name') params.set('sort', sortCriteria);
    if (sortDirection !== 'asc') params.set('order', sortDirection);
    
    setSearchParams(params);
  }, [searchQuery, selectedSeason, selectedTypes, sortCriteria, sortDirection]);

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
        min_days: dest.min_days || 0,
        max_days: dest.max_days || 0,
        estimatedBudget: dest.estimatedBudget || 0,
        dateAdded: dest.dateAdded || new Date().toISOString(),
        imageUrl: dest.imageUrl || ''
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
      console.log('Adding destination with data:', newDest);
      const { min_days, max_days } = await parseDatePeriod(newDest.daysRequired);

      const destinationsRef = ref(database, `users/${userId}/destinations`);
      await push(destinationsRef, {
        ...newDest,
        min_days,
        max_days,
        imageUrl: newDest.imageUrl || '',
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
      console.log('Updating destination with data:', updates);
      const { min_days, max_days } = await parseDatePeriod(updates.daysRequired);

      const destinationRef = ref(database, `users/${userId}/destinations/${destinationId}`);
      await set(destinationRef, {
        ...updates,
        min_days,
        max_days,
        imageUrl: updates.imageUrl || '',
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

  const handleGetSuggestions = () => {
    alert('AI Suggestions feature is coming soon! Stay tuned for personalized travel recommendations.');
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
        const [minDays, maxDays] = [dest.min_days, dest.max_days];
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
            const [min, max] = [days.min_days, days.max_days];
            return max ? (min + max) / 2 : min;
          };
          comparison = getAverageDays(a) - getAverageDays(b);
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
        {filteredAndSortedDestinations.length > 0 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200"
          >
            Add Destination
          </button>
        )}
      </div>

      {filteredAndSortedDestinations.length > 0 ? (
        <>
          <TravelCalendar onDateRangeChange={handleDateRangeChange} />

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
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredAndSortedDestinations.map(destination => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onDelete={handleDeleteDestination}
                onEdit={() => setEditingDestination(destination)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md w-full shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No destinations found</h2>
            <p className="text-gray-600 mb-8">Add your first destination to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 w-full"
            >
              Add Your First Destination
            </button>
          </div>
        </div>
      )}

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
