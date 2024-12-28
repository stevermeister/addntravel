import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, remove, set, get, DataSnapshot } from 'firebase/database';
import { database, auth } from '../utils/firebase';
import { useSearchParams } from 'react-router-dom';
import { parseDatePeriod } from '../utils/date';
import DestinationCard from '../components/DestinationCard';
import DestinationForm from '../components/DestinationForm';
import TravelCalendar from '../components/TravelCalendar';
import SearchBar from '../components/SearchBar'; // Import the new SearchBar component
import { Destination } from '../types/destination';
import { DateRange } from '../types/dateRange';

const Wishlist: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedDateRange) {
      params.set('startDate', selectedDateRange.startDate.toISOString());
      params.set('endDate', selectedDateRange.endDate.toISOString());
      params.set('availableDays', selectedDateRange.availableDays.toString());
      if (selectedDateRange.seasons) params.set('seasons', selectedDateRange.seasons.join(','));
    }
    
    setSearchParams(params);
  }, [searchQuery, selectedDateRange, selectedTag, setSearchParams]);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const availableDays = searchParams.get('availableDays');
    const seasons = searchParams.get('seasons');

    setSearchQuery(search);
    setSelectedTag(tag);
    
    if (startDate && endDate && availableDays) {
      setSelectedDateRange({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        availableDays: parseInt(availableDays, 10),
        seasons: seasons ? seasons.split(',') : undefined
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return;
    }

    const destinationsRef = ref(database, `users/${userId}/destinations`);
    const unsubscribe = onValue(destinationsRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const destinationsList = data ? Object.entries(data).map(([id, dest]: [string, any]) => {
        let preferredSeasons = [];
        if (dest.preferredSeasons) {
          preferredSeasons = Array.isArray(dest.preferredSeasons) ? dest.preferredSeasons : [dest.preferredSeasons];
        } else if (dest.preferredSeason) {
          preferredSeasons = Array.isArray(dest.preferredSeason) ? dest.preferredSeason : [dest.preferredSeason];
        }

        return {
          id,
          name: dest.name,
          description: dest.description,
          preferredSeasons,
          tags: dest.tags || [],
          daysRequired: dest.daysRequired || '',
          min_days: dest.min_days || 0,
          max_days: dest.max_days || 0,
          estimatedBudget: dest.estimatedBudget || 0,
          dateAdded: dest.dateAdded || '1970-01-01T00:00:00.000Z',
          imageUrl: dest.imageUrl || '',
          visitDate: dest.visitDate,
          budget: dest.budget,
          createdAt: dest.createdAt || dest.dateAdded || '1970-01-01T00:00:00.000Z',
          type: dest.type
        }
      }) : [];
      setDestinations(destinationsList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const hasNoParams = Array.from(searchParams.entries()).length === 0;
    if (hasNoParams) {
      setSearchQuery('');
      setSelectedDateRange(null);
    }
  }, [searchParams]);

  const handleAddDestination = async (newDest: Omit<Destination, 'id'>) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      console.log('Adding destination with data:', newDest);
      const { min_days, max_days } = await parseDatePeriod(newDest.daysRequired || '0');

      // Search for an image if one isn't provided
      let imageUrl = newDest.imageUrl;
      if (!imageUrl) {
        const { searchImages } = await import('../utils/imageSearch');
        const results = await searchImages(newDest.name);
        if (results.length > 0) {
          const randomIndex = Math.floor(Math.random() * results.length);
          imageUrl = results[randomIndex].link;
        }
      }

      const now = new Date().toISOString();
      const destinationsRef = ref(database, `users/${userId}/destinations`);
      await push(destinationsRef, {
        ...newDest,
        min_days,
        max_days,
        imageUrl: imageUrl || '',
        daysRequired: newDest.daysRequired || '0',
        preferredSeasons: newDest.preferredSeasons || [],
        dateAdded: now,
        createdAt: now
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding destination:', error);
    }
  };

  const handleEditDestination = async (destinationId: string, updates: Partial<Destination>) => {
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
        ...currentData,
        ...updates,
        imageUrl: updates.imageUrl || currentData.imageUrl || '',
        preferredSeasons: updates.preferredSeasons || currentData.preferredSeasons || [],
        dateAdded: currentData.dateAdded || currentData.createdAt || new Date().toISOString(),
        createdAt: currentData.createdAt || currentData.dateAdded || new Date().toISOString()
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

  const handleDeleteDestination = async (destinationId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const destinationRef = ref(database, `users/${userId}/destinations/${destinationId}`);
      await remove(destinationRef);
    } catch (error) {
      console.error('Error removing destination:', error);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedDateRange(range);
    setIsCalendarOpen(false);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const filteredAndSortedDestinations = useMemo(() => {
    // First filter
    const filtered = destinations.filter(destination => {
      const matchesSearch = !searchQuery || 
        destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = !selectedTag || 
        destination.tags?.includes(selectedTag);

      const matchesDateRange = !selectedDateRange ||
        (!destination.daysRequired || 
          parseInt(destination.daysRequired) <= selectedDateRange.availableDays);

      return matchesSearch && matchesTag && matchesDateRange;
    });

    // Then sort by createdAt in descending order
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dateAdded || 0).getTime();
      const dateB = new Date(b.createdAt || b.dateAdded || 0).getTime();
      return dateB - dateA;
    });
  }, [destinations, searchQuery, selectedTag, selectedDateRange]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Type to search..."
        />
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Select dates</span>
        </button>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add Destination</span>
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
      </div>

      {selectedDateRange && (
        <div className="mb-4 p-4 bg-blue-50 rounded flex justify-between items-center">
          <div>
            <span className="font-semibold">Selected Dates: </span>
            {selectedDateRange.startDate.toLocaleDateString()} - {selectedDateRange.endDate.toLocaleDateString()}
            <span className="ml-4">
              <span className="font-semibold">Available Days: </span>
              {selectedDateRange.availableDays}
            </span>
          </div>
          <button
            onClick={() => setSelectedDateRange(null)}
            className="text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        </div>
      )}

      {(selectedTag || searchQuery || selectedDateRange) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedTag && (
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
              onClick={() => setSelectedTag(null)}
            >
              #{selectedTag} ×
            </span>
          )}
          {searchQuery && (
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
              onClick={() => setSearchQuery('')}
            >
              Search: {searchQuery} ×
            </span>
          )}
          {selectedDateRange && (
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
              onClick={() => setSelectedDateRange(null)}
            >
              {selectedDateRange.availableDays} days available ×
            </span>
          )}
        </div>
      )}

      {filteredAndSortedDestinations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery
              ? 'No destinations found matching your search criteria.'
              : 'No destinations added yet. Add your first destination!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredAndSortedDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onDelete={() => handleDeleteDestination(destination.id!)}
              onEdit={() => setEditingDestination(destination)}
              onTagClick={handleTagClick}
            />
          ))}
        </div>
      )}

      {showAddForm && (
        <DestinationForm
          onSubmit={handleAddDestination}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingDestination && (
        <DestinationForm
          destination={editingDestination}
          onSubmit={(updates) => editingDestination.id && handleEditDestination(editingDestination.id, updates)}
          onCancel={() => setEditingDestination(null)}
        />
      )}

      {isCalendarOpen && (
        <TravelCalendar
          onDateRangeChange={handleDateRangeChange}
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}
    </div>
  );
};

export default Wishlist;
