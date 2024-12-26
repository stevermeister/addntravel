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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('dateAdded');
  const [sortDirection, setSortDirection] = useState('desc');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedSeason) params.set('season', selectedSeason);
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (sortCriteria !== 'dateAdded') params.set('sort', sortCriteria);
    if (sortDirection !== 'desc') params.set('order', sortDirection);
    
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
      if (!a || !b) return 0;
      let comparison = 0;
      
      switch (sortCriteria) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
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
          comparison = (new Date(a.dateAdded || 0)) - (new Date(b.dateAdded || 0));
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
    <div className="container mx-auto px-4 py-8">
      {destinations.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 whitespace-nowrap">Travel Wishlist</h1>
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search destinations..."
                    className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 whitespace-nowrap"
            >
              Add Destination
            </button>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar with calendar and filters */}
            <div className="col-span-12 md:col-span-3 space-y-4">
              <TravelCalendar onDateRangeChange={handleDateRangeChange} />
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div 
                  className="flex justify-between items-center cursor-pointer" 
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {[
                        selectedSeason && '🗓 Season',
                        selectedTypes.length > 0 && `🏷 ${selectedTypes.length} types`,
                        sortCriteria !== 'name' && `📊 Sort: ${sortCriteria}`
                      ].filter(Boolean).join(', ') || 'No filters applied'}
                    </p>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors">
                    {isFiltersExpanded ? '▼' : '▶'}
                  </button>
                </div>
                
                {isFiltersExpanded && (
                  <div className="mt-4">
                    <FilterSortControls
                      selectedSeason={selectedSeason}
                      setSelectedSeason={setSelectedSeason}
                      selectedTypes={selectedTypes}
                      setSelectedTypes={setSelectedTypes}
                      sortCriteria={sortCriteria}
                      setSortCriteria={setSortCriteria}
                      sortDirection={sortDirection}
                      setSortDirection={setSortDirection}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Main content area */}
            <div className="col-span-12 md:col-span-9">
              {/* Active filters display */}
              {(selectedSeason || selectedTypes.length > 0) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-gray-600">Active filters:</span>
                      {selectedSeason && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {selectedSeason}
                        </span>
                      )}
                      {selectedTypes.map(type => (
                        <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSeason('');
                        setSelectedTypes([]);
                        setSortCriteria('name');
                        setSortDirection('asc');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap ml-2"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* Destinations grid */}
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
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Travel Wishlist</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No destinations found</h2>
            <p className="text-gray-600 mb-8">Add your first destination to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
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
