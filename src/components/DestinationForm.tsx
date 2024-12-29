/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Destination, TravelPeriod } from '../types/destination';

const TRAVEL_PERIODS: TravelPeriod[] = [
  {
    label: 'Weekend Trip',
    minDays: 1,
    maxDays: 3,
  },
  {
    label: 'Short Getaway',
    minDays: 3,
    maxDays: 5,
  },
  {
    label: 'Weeklong Escape',
    minDays: 5,
    maxDays: 7,
  },
  {
    label: 'Leisure Week',
    minDays: 7,
    maxDays: 9,
  },
  {
    label: 'Two-Week Retreat',
    minDays: 12,
    maxDays: 16,
  },
  {
    label: 'Grand Adventure',
    minDays: 19,
    maxDays: 23,
  },
  {
    label: 'Full Sojourn',
    minDays: 25,
    maxDays: 35,
  },
];

const MIN_BUDGET = 0;
const MAX_BUDGET = 10000;
const BUDGET_STEP = 500;

interface FormData {
  destinationName: string;
  description: string;
  estimatedBudget?: number;
  preferredSeasons: string[];
  daysRequired?: TravelPeriod;
  tags: string[];
  coordinates?: { lat: number; lng: number } | null;
}

interface DestinationFormProps {
  destination?: Destination;
  onSubmit: (data: Omit<Destination, 'id'>) => void;
  onCancel: () => void;
}

export default function DestinationForm({ destination, onSubmit, onCancel }: DestinationFormProps) {
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [placesServiceEnabled, setPlacesServiceEnabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Places API is available and working
    const checkPlacesService = async () => {
      try {
        const service = new google.maps.places.AutocompleteService();
        await service.getPlacePredictions({
          input: 'test',
          types: ['(cities)'],
        });
      } catch (error) {
        console.warn('Places API not available:', error);
        setPlacesServiceEnabled(false);
      }
    };

    checkPlacesService();
  }, []);

  useEffect(() => {
    // Reset selected index when predictions change
    setSelectedIndex(-1);
  }, [predictions]);

  const [formData, setFormData] = useState<FormData>({
    destinationName: '',
    description: '',
    estimatedBudget: undefined,
    preferredSeasons: [],
    daysRequired: undefined,
    tags: [],
  });

  const initialFormData = useMemo((): FormData => {
    if (destination) {
      return {
        destinationName: destination.name || '',
        description: destination.description || '',
        estimatedBudget: destination.estimatedBudget,
        preferredSeasons: destination.preferredSeasons || [],
        daysRequired:
          typeof destination.daysRequired === 'string'
            ? { label: destination.daysRequired, minDays: 1, maxDays: 1 }
            : destination.daysRequired,
        tags: destination.tags || [],
        coordinates: destination.coordinates,
      };
    }
    return {
      destinationName: '',
      description: '',
      estimatedBudget: undefined,
      preferredSeasons: [],
      daysRequired: undefined,
      tags: [],
    };
  }, [destination]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  useEffect(() => {
    if (destination) {
      setFormData(initialFormData);
    }
  }, [destination, initialFormData]);

  const searchPlaces = async (query: string) => {
    if (!query || query.length < 2 || !placesServiceEnabled) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      const service = new google.maps.places.AutocompleteService();
      const results = await service.getPlacePredictions({
        input: query,
        types: ['(cities)'],
      });

      if (results?.predictions) {
        setPredictions(results.predictions);
        setShowPredictions(true);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlacesServiceEnabled(false); // Disable service if it fails
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const extractCityName = (description: string): string => {
    // Split by commas and take the first part
    return description.split(',')[0].trim();
  };

  const handlePlaceSelect = async (placeId: string, description: string) => {
    const cityName = extractCityName(description);

    if (!placesServiceEnabled) {
      setFormData((prev) => ({
        ...prev,
        destinationName: cityName,
      }));
      setShowPredictions(false);
      setPredictions([]);
      return;
    }

    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));

      service.getDetails(
        {
          placeId: placeId,
          fields: ['geometry'],
        },
        (
          result: google.maps.places.PlaceResult | null,
          status: google.maps.places.PlacesServiceStatus,
        ) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            result?.geometry?.location &&
            typeof result.geometry.location.lat === 'function' &&
            typeof result.geometry.location.lng === 'function'
          ) {
            const location = result.geometry.location as google.maps.LatLng;
            setFormData((prev) => ({
              ...prev,
              destinationName: cityName,
              coordinates: {
                lat: location.lat(),
                lng: location.lng(),
              },
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              destinationName: cityName,
            }));
          }
          setShowPredictions(false);
          setPredictions([]);
        },
      );
    } catch (error) {
      console.error('Error fetching place details:', error);
      setPlacesServiceEnabled(false);
      setFormData((prev) => ({
        ...prev,
        destinationName: cityName,
      }));
      setShowPredictions(false);
      setPredictions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPredictions || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = predictions[selectedIndex];
          handlePlaceSelect(selected.place_id, selected.description);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowPredictions(false);
        setPredictions([]);
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const suggestionItems = suggestionsRef.current.children;
      if (suggestionItems[selectedIndex]) {
        suggestionItems[selectedIndex].scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'destinationName') {
      // When manually typing, remove coordinates until a place is selected
      setFormData((prev) => ({
        ...prev,
        destinationName: value,
        coordinates: undefined, // Reset coordinates when manually typing
      }));

      // Only try to search if Places API is enabled
      if (placesServiceEnabled) {
        if (searchTimeout.current) {
          clearTimeout(searchTimeout.current);
        }
        searchTimeout.current = setTimeout(() => {
          if (value.length >= 2) {
            searchPlaces(value);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        }, 300);
      }
    } else if (name === 'description') {
      const extractedTags = extractTagsFromDescription(value);
      setFormData((prev) => ({
        ...prev,
        description: value,
        tags: extractedTags,
      }));
    } else if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const season = checkbox.value;

      setFormData((prev) => ({
        ...prev,
        preferredSeasons: checkbox.checked
          ? [...prev.preferredSeasons, season]
          : prev.preferredSeasons.filter((s) => s !== season),
      }));
    } else if (name === 'estimatedBudget') {
      setFormData((prev) => ({
        ...prev,
        estimatedBudget: value ? Number(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.destinationName.trim()) {
      newErrors.destinationName = 'Destination name is required';
    }

    if (formData.estimatedBudget && formData.estimatedBudget < 0) {
      newErrors.estimatedBudget = 'Budget cannot be negative';
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const submissionData: Omit<Destination, 'id'> = {
        name: formData.destinationName.trim(),
        description: formData.description.trim(),
        estimatedBudget: formData.estimatedBudget || 0,
        preferredSeasons: formData.preferredSeasons,
        daysRequired: formData.daysRequired || { label: '1 day', minDays: 1, maxDays: 1 },
        tags: formData.tags,
        createdAt: new Date().toISOString(),
        imageUrl: '',
        coordinates: formData.coordinates || null,
      };

      onSubmit(submissionData);
    }
  };

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      onCancel();
    } else {
      onCancel();
    }
  }, [hasChanges, onCancel]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [handleCancel]);

  const extractTagsFromDescription = (text: string): string[] => {
    const tagRegex = /#[\w-]+/g;
    const matches = text.match(tagRegex) || [];
    return Array.from(new Set(matches.map((tag) => tag.slice(1))));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white w-full md:w-2/3 lg:w-1/2 md:rounded-xl max-h-screen md:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {destination ? 'Edit Destination' : 'Add New Destination'}
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="relative">
            <label
              htmlFor="destinationName"
              className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2"
            >
              Destination Name*
            </label>
            <input
              id="destinationName"
              type="text"
              name="destinationName"
              value={formData.destinationName}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border border-gray-200 text-gray-900 text-base md:text-lg placeholder:text-gray-400"
              placeholder="e.g., Paris, France"
              required
              role="combobox"
              aria-expanded={showPredictions}
              aria-controls="destination-suggestions"
              aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
            />
            {showPredictions && predictions.length > 0 && (
              <div
                ref={suggestionsRef}
                id="destination-suggestions"
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                role="listbox"
              >
                {predictions.map((prediction, index) => (
                  <button
                    key={prediction.place_id}
                    id={`suggestion-${index}`}
                    type="button"
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 ${
                      index === selectedIndex ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => handlePlaceSelect(prediction.place_id, prediction.description)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    {prediction.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2"
            >
              Description
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 md:px-4 py-2 rounded-lg border border-gray-200 text-gray-900 text-sm md:text-base placeholder:text-gray-400"
                rows={3}
                placeholder="Add description and use #tags"
              />
              <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Selected tags">
                {formData.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="text-xs md:text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-1"
                    aria-label={`Remove tag ${tag}`}
                  >
                    {tag}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="estimatedBudget"
              className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2"
            >
              Estimated Budget (€)
            </label>
            <input
              type="range"
              id="estimatedBudget"
              name="estimatedBudget"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={BUDGET_STEP}
              value={formData.estimatedBudget || 0}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="mt-2 text-sm text-gray-600">
              {formData.estimatedBudget ? `€${formData.estimatedBudget}` : 'Not specified'}
            </div>
          </div>

          <div>
            <label
              htmlFor="preferredSeasons"
              className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2"
            >
              Preferred Seasons
            </label>
            <div
              id="preferredSeasons"
              role="group"
              aria-label="Preferred Seasons"
              className="flex flex-wrap gap-1.5 md:gap-2"
            >
              {['Any', 'Spring', 'Summer', 'Fall', 'Winter'].map((season) => {
                const isSelected =
                  season === 'Any'
                    ? formData.preferredSeasons.length === 0
                    : formData.preferredSeasons.includes(season);

                return (
                  <button
                    key={season}
                    type="button"
                    onClick={() => {
                      if (season === 'Any') {
                        setFormData((prev) => ({
                          ...prev,
                          preferredSeasons: [],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          preferredSeasons: isSelected
                            ? prev.preferredSeasons.filter((s) => s !== season)
                            : [...prev.preferredSeasons, season],
                        }));
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {season}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="travelPeriod"
              className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2"
            >
              Travel Period
            </label>
            <div
              id="travelPeriod"
              role="group"
              aria-label="Travel Period"
              className="grid grid-cols-2 md:grid-cols-3 gap-2"
            >
              {TRAVEL_PERIODS.map((period) => (
                <button
                  key={period.label}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      daysRequired: prev.daysRequired?.label === period.label ? undefined : period,
                    }));
                  }}
                  className={`p-2 md:p-3 rounded-lg text-xs md:text-sm font-medium text-center transition-colors ${
                    formData.daysRequired?.label === period.label
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div>{period.label}</div>
                  <div className="text-xs text-gray-500">
                    {period.minDays}-{period.maxDays} days
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-3 pb-4 mt-4 -mx-4 px-4 flex gap-3 md:static md:border-0 md:pt-2 md:mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {destination ? 'Save Changes' : 'Add Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
