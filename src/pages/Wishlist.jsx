import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, remove, set, get } from 'firebase/database';
import { database, auth } from '../utils/firebase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { parseDatePeriod } from '../utils/dateParser';
import DestinationCard from '../components/DestinationCard';
import DestinationForm from '../components/DestinationForm';
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
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('dateAdded');
  const [sortDirection, setSortDirection] = useState('desc');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (sortCriteria !== 'dateAdded') params.set('sort', sortCriteria);
    if (sortDirection !== 'desc') params.set('order', sortDirection);
    if (selectedDateRange) {
      params.set('startDate', selectedDateRange.startDate.toISOString());
      params.set('endDate', selectedDateRange.endDate.toISOString());
      params.set('availableDays', selectedDateRange.availableDays.toString());
      if (selectedDateRange.seasons) params.set('seasons', selectedDateRange.seasons.join(','));
    }
    
    setSearchParams(params);
  }, [searchQuery, sortCriteria, sortDirection, selectedDateRange]);

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
        dateAdded: dest.dateAdded || '1970-01-01T00:00:00.000Z',
        imageUrl: dest.imageUrl || ''
      })) : [];
      setDestinations(destinationsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'dateAdded';
    const order = searchParams.get('order') || 'desc';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const availableDays = searchParams.get('availableDays');
    const seasons = searchParams.get('seasons');

    setSearchQuery(search);
    setSortCriteria(sort);
    setSortDirection(order);
    
    if (startDate && endDate && availableDays) {
      setSelectedDateRange({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        availableDays: parseInt(availableDays, 10),
        seasons: seasons ? seasons.split(',') : null
      });
    }
  }, []);

  useEffect(() => {
    const hasNoParams = Array.from(searchParams.entries()).length === 0;
    if (hasNoParams) {
      setSearchQuery('');
      setSortCriteria('dateAdded');
      setSortDirection('desc');
      setSelectedDateRange(null);
    }
  }, [searchParams]);

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

      const destinationRef = ref(database, `users/${userId}/destinations/${destinationId}`);
      
      // Get current destination data
      const snapshot = await get(destinationRef);
      const currentData = snapshot.val();

      // Prepare update data
      const updateData = {
        ...updates,
        imageUrl: updates.imageUrl || '',
        dateAdded: currentData.dateAdded || new Date().toISOString()
      };

      // Update the destination
      await set(destinationRef, updateData);
      
      // Update local state to reflect changes immediately
      setDestinations(prevDestinations => 
        prevDestinations.map(dest => 
          dest.id === destinationId ? { ...dest, ...updateData } : dest
        )
      );

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

  const handleDateRangeChange = ({ startDate, endDate, availableDays, seasons }) => {
    setSelectedDateRange({ startDate, endDate, availableDays, seasons });
  };

  const sortedDestinations = useMemo(() => {
    // First apply filters
    let filtered = destinations.filter(dest => {
      // Search filter
      const matchesSearch = !searchQuery || (
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dest.description && dest.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      // Date range filter
      const matchesDateRange = !selectedDateRange || (() => {
        if (!dest.min_days) return true;
        
        const availableDays = selectedDateRange.availableDays;
        const destMinDays = dest.min_days;
        const destMaxDays = dest.max_days || destMinDays;
        
        // Calculate flexible range (+/- 50%)
        const minFlexible = destMinDays * 0.5;
        const maxFlexible = destMaxDays * 1.5;

        // Season match
        const matchesSeason = !dest.preferredSeason || !selectedDateRange.seasons || 
          selectedDateRange.seasons.includes(dest.preferredSeason);
        
        return availableDays >= minFlexible && availableDays <= maxFlexible && matchesSeason;
      })();

      return matchesSearch && matchesDateRange;
    });

    // Then sort
    return filtered.sort((a, b) => {
      if (!a || !b) return 0;
      let comparison = 0;
      
      switch (sortCriteria) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'estimatedBudget':
          comparison = (a.estimatedBudget || 0) - (b.estimatedBudget || 0);
          break;
        case 'min_days':
          comparison = (a.min_days || 0) - (b.min_days || 0);
          break;
        case 'dateAdded':
          const dateA = new Date(a.dateAdded || 0).getTime();
          const dateB = new Date(b.dateAdded || 0).getTime();
          comparison = dateB - dateA; // Newest first
          break;
        default:
          comparison = 0;
      }
      
      // For dates, we want desc to show newest first, so we don't need to reverse the comparison
      return sortCriteria === 'dateAdded' ? comparison : (sortDirection === 'asc' ? comparison : -comparison);
    });
  }, [
    destinations,
    searchQuery,
    selectedDateRange,
    sortCriteria,
    sortDirection
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {destinations.length > 0 ? (
        <>
          {/* Search and Add Section */}
          <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  search
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative">
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full sm:w-auto px-4 py-2 bg-white/70 backdrop-blur border border-gray-200 rounded-2xl shadow-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-gray-600">calendar_month</span>
                  <span className="text-gray-700">
                    {selectedDateRange && selectedDateRange.startDate && selectedDateRange.endDate
                      ? `${new Date(selectedDateRange.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        → ${new Date(selectedDateRange.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                      : 'Select dates'}
                  </span>
                  {selectedDateRange && selectedDateRange.startDate && selectedDateRange.endDate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateRange(null);
                      }}
                      className="ml-1 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </button>
                {isCalendarOpen && (
                  <div className="absolute right-0 mt-2 z-10">
                    <TravelCalendar
                      onDateRangeChange={handleDateRangeChange}
                      isOpen={isCalendarOpen}
                      onClose={() => setIsCalendarOpen(false)}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-2xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Add Destination
              </button>
            </div>
          </div>

          {/* Destinations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDestinations.map(destination => (
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
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Start Your Travel Wishlist</h2>
            <p className="text-gray-600 mb-8">
              Create your personalized collection of dream destinations. Add places you'd love to visit and organize them by season, duration, and budget.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add First Destination
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-sm text-gray-500 bg-gray-50">or get started with</span>
                </div>
              </div>

              <button
                onClick={() => document.getElementById('load-sample-button')?.click()}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium group"
              >
                <span className="material-symbols-outlined text-amber-500 group-hover:text-amber-600">auto_awesome</span>
                Get Travel Inspiration
              </button>
            </div>
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
        />
      )}
    </div>
  );
};

export default Wishlist;
