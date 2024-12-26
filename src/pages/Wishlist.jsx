import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, remove, set } from 'firebase/database';
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
      params.set('startDate', selectedDateRange.startDate);
      params.set('endDate', selectedDateRange.endDate);
      params.set('availableDays', selectedDateRange.availableDays.toString());
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
        dateAdded: dest.dateAdded || new Date().toISOString(),
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

    setSearchQuery(search);
    setSortCriteria(sort);
    setSortDirection(order);
    
    if (startDate && endDate && availableDays) {
      setSelectedDateRange({
        startDate,
        endDate,
        availableDays: parseInt(availableDays, 10)
      });
    }
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
        
        return availableDays >= minFlexible && availableDays <= maxFlexible;
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
        default:
          comparison = new Date(b.dateAdded) - new Date(a.dateAdded);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
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
          {/* Header with search and add button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            <div className="flex-1 w-full md:w-auto md:mr-4">
              <div className="flex gap-3 items-center w-full">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Type to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 px-4 bg-white/90 backdrop-blur border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none pl-11 shadow-sm placeholder:text-gray-400"
                  />
                  <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <span className="material-symbols-outlined text-xl">search</span>
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className={`h-12 px-4 bg-white/90 backdrop-blur border border-gray-200 rounded-2xl flex items-center gap-2 transition-all shadow-sm
                      ${selectedDateRange 
                        ? 'hover:border-gray-300' 
                        : 'hover:border-gray-300'
                      }`}
                  >
                    <span className="material-symbols-outlined text-xl text-gray-400">calendar_month</span>
                    {selectedDateRange ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {new Date(selectedDateRange.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          <span className="mx-1.5 text-gray-400">→</span>
                          {new Date(selectedDateRange.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateRange(null);
                          }}
                          className="p-1 -mr-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="Clear dates"
                        >
                          <span className="material-symbols-outlined text-[18px] text-gray-400 hover:text-gray-600">close</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Select dates</span>
                    )}
                  </button>
                  <TravelCalendar
                    onDateRangeChange={handleDateRangeChange}
                    isOpen={isCalendarOpen}
                    onClose={() => setIsCalendarOpen(false)}
                  />
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="h-12 px-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap font-medium shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Destination
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Main content area */}
            <div className="col-span-12 space-y-6">
              {/* Destinations grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedDestinations.map(destination => (
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
        />
      )}
    </div>
  );
};

export default Wishlist;
