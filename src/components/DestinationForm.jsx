import React, { useState, useEffect, useCallback } from 'react';
import { parseDatePeriod } from '../utils/date';
import debounce from 'lodash/debounce';
import { getSuggestedTags, correctTagSpelling, getLocalTagSuggestions } from '../utils/tagHelper';
import { destinations } from '../data/destinations';
import styles from './DestinationForm.module.css';

const DestinationForm = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    destinationName: '',
    description: '',
    estimatedBudget: '',
    preferredSeason: '', // Empty string will show as 'All'
    daysRequired: '',
    min_days: 0,
    max_days: 0,
    tags: '',
    imageUrl: '',
    destinationSelected: false
  });

  const [errors, setErrors] = useState({});
  const [daysHint, setDaysHint] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(-1);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const searchImages = async (query) => {
    try {
      const baseUrl = 'https://www.googleapis.com/customsearch/v1';
      const params = {
        key: 'AIzaSyA4K-ifLYl9NBH5m-L2XwRpQ-UGhJ9Lsgc',
        cx: 'b28797b508c8e4146',
        q: `${query} photo`,
        searchType: 'image',
        num: '10',
        imgSize: 'large',
        imgType: 'photo'
      };
      
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `${baseUrl}?${queryString}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.items.length);
        return data.items[randomIndex].link;
      }
      return null;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    
    if (Object.keys(errors).length === 0) {
      try {
        setIsLoadingImages(true);
        
        let min_days = 0;
        let max_days = 0;

        // If editing, use existing min_days and max_days if no new period is specified
        if (initialData && !formData.daysRequired) {
          min_days = initialData.min_days || 0;
          max_days = initialData.max_days || 0;
        } else if (formData.daysRequired) {
          try {
            [min_days, max_days] = parseDatePeriod(formData.daysRequired);
          } catch (error) {
            console.warn('Error parsing period:', error);
            min_days = 0;
            max_days = 0;
          }
        }
        
        // Search for new image if:
        // 1. Adding new destination
        // 2. No image URL exists
        // 3. Editing and destination name has changed
        let imageUrl = formData.imageUrl;
        const shouldUpdateImage = !initialData || // new destination
                                !imageUrl || // no image
                                (initialData && initialData.name !== formData.destinationName); // name changed during edit
        
        if (shouldUpdateImage) {
          imageUrl = await searchImages(formData.destinationName);
        }

        const submissionData = {
          ...formData,
          name: formData.destinationName,
          imageUrl: imageUrl || 'https://via.placeholder.com/800x400?text=No+Image+Available',
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          min_days,
          max_days,
          estimatedBudget: Number(formData.estimatedBudget) || 0
        };
        
        console.log('Submitting data:', submissionData);
        await onSubmit(submissionData);
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
        setErrors({ submit: 'Error submitting form. Please try again.' });
      } finally {
        setIsLoadingImages(false);
      }
    } else {
      setErrors(errors);
    }
  };

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        destinationName: initialData.destinationName || initialData.name || '',
        tags: initialData.tags.join(', '),
        estimatedBudget: initialData.estimatedBudget.toString(),
        min_days: initialData.min_days || 0,
        max_days: initialData.max_days || 0,
        imageUrl: initialData.imageUrl || '',
        destinationSelected: true
      };
      setFormData(formattedData);
      
      // Clear any existing tag suggestions when editing
      setTagSuggestions([]);
      setCurrentTagInput('');
    }
  }, [initialData]);

  // Add ESC key handler
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Get tag suggestions when typing
  useEffect(() => {
    let mounted = true;

    const fetchSuggestions = async () => {
      if (!currentTagInput.trim()) {
        setTagSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        // Always get local suggestions
        const localSuggestions = getLocalTagSuggestions(currentTagInput.trim());
        if (mounted) {
          setTagSuggestions(localSuggestions);
        }

        // Only get AI/location-based suggestions if we have a destination name
        if (formData.destinationName) {
          const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
          const aiSuggestions = await getSuggestedTags(formData.destinationName, currentTags);
          
          if (mounted) {
            // Combine and deduplicate suggestions
            const allSuggestions = [...new Set([...localSuggestions, ...aiSuggestions])];
            setTagSuggestions(allSuggestions);
          }
        }
      } catch (error) {
        console.error('Error fetching tag suggestions:', error);
      } finally {
        if (mounted) {
          setIsLoadingSuggestions(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      mounted = false;
    };
  }, [currentTagInput, formData.destinationName, formData.tags]);

  // Get destination suggestions when typing the name
  useEffect(() => {
    if (formData.destinationName && !formData.destinationSelected) {
      const suggestions = destinations
        .filter(d => d.name.toLowerCase().includes(formData.destinationName.toLowerCase()))
        .slice(0, 5);
      setDestinationSuggestions(suggestions);
    } else {
      setDestinationSuggestions([]);
    }
  }, [formData.destinationName, formData.destinationSelected]);

  const validate = () => {
    const newErrors = {};
    if (!formData.destinationName) {
      newErrors.destinationName = 'Destination name is required';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'destinationName') {
      // When typing manually, set destinationSelected to false
      setFormData(prev => ({
        ...prev,
        [name]: value,
        destinationSelected: false
      }));

      // Only show suggestions if there's input
      if (value.trim()) {
        const suggestions = destinations.filter(dest =>
          dest.name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        setDestinationSuggestions(suggestions);
      } else {
        setDestinationSuggestions([]);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear any error when the field is being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Update days hint if daysRequired field changes
    if (name === 'daysRequired') {
      updateDaysHint(value);
    }
  };

  // Debounced function to update days hint
  const updateDaysHint = useCallback(
    debounce(async (value) => {
      if (!value) {
        setDaysHint('');
        return;
      }
      try {
        const { min_days, max_days } = await parseDatePeriod(value);
        if (min_days === max_days) {
          setDaysHint(`≈ ${min_days} days`);
        } else {
          setDaysHint(`≈ ${min_days}-${max_days} days`);
        }
        // Also update the hidden fields
        setFormData(prev => ({
          ...prev,
          min_days,
          max_days
        }));
      } catch (error) {
        console.error('Error parsing days:', error);
        setDaysHint('Invalid format');
      }
    }, 500),
    []
  );

  const handleTagInputChange = (e) => {
    const input = e.target.value;
    setCurrentTagInput(input);
    
    if (input.endsWith(',')) {
      // Add the tag when comma is typed
      const newTag = input.slice(0, -1).trim();
      if (newTag) {
        handleAddTag(newTag);
        setCurrentTagInput(''); // Clear the input after adding tag
      }
    }
  };

  // Handle adding a new tag
  const handleAddTag = (tag) => {
    const tagToAdd = tag.trim();
    if (!tagToAdd) return;
    
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (!currentTags.includes(tagToAdd)) {
      const newTags = [...currentTags, tagToAdd].join(', ');
      setFormData(prev => ({
        ...prev,
        tags: newTags
      }));
      setCurrentTagInput(''); // Clear the input after adding tag
      setTagSuggestions([]); // Clear suggestions after adding tag
    }
  };

  // Handle selecting a tag suggestion
  const handleTagSuggestionClick = (tag) => {
    handleAddTag(tag);
  };

  // Handle keyboard navigation
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && tagSuggestions.length > 0) {
        handleTagSuggestionClick(tagSuggestions[selectedSuggestionIndex]);
      } else if (currentTagInput.trim()) {
        handleAddTag(currentTagInput);
      }
      return;
    }

    if (tagSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < tagSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Escape':
        e.preventDefault();
        setTagSuggestions([]);
        setSelectedSuggestionIndex(-1);
        break;
      case 'Tab':
        if (tagSuggestions.length > 0) {
          e.preventDefault();
          const index = selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0;
          handleTagSuggestionClick(tagSuggestions[index]);
        }
        break;
    }
  };

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [tagSuggestions]);

  // Reset selected index when destination suggestions change
  useEffect(() => {
    setSelectedDestinationIndex(-1);
  }, [destinationSuggestions]);

  const handleDestinationKeyDown = (e) => {
    if (destinationSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedDestinationIndex(prev => 
          prev < destinationSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedDestinationIndex(prev => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'Enter' && selectedDestinationIndex >= 0) {
        e.preventDefault();
        const selectedDestination = destinationSuggestions[selectedDestinationIndex];
        handleDestinationSelect(selectedDestination);
      }
    }
  };

  // Set default image when selecting a destination
  const handleDestinationSelect = (destination) => {
    setFormData(prev => ({
      ...prev,
      destinationName: destination.name,
      imageUrl: destination.imageUrl || '',
      tags: destination.tags.join(', '),
      destinationSelected: true
    }));
    setDestinationSuggestions([]);
    setSelectedDestinationIndex(-1);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {initialData ? 'Edit' : 'Add New'} Destination
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Name*
            </label>
            <div className="relative">
              <input
                type="text"
                name="destinationName"
                value={formData.destinationName}
                onChange={handleChange}
                onKeyDown={handleDestinationKeyDown}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.destinationName ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                autoComplete="off"
                placeholder="Enter destination name"
              />
              {destinationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-b shadow-lg">
                  {destinationSuggestions.map((dest, index) => (
                    <div
                      key={dest.name}
                      className={`p-2 cursor-pointer ${
                        index === selectedDestinationIndex
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleDestinationSelect(dest)}
                      onMouseEnter={() => setSelectedDestinationIndex(index)}
                    >
                      {dest.name}
                    </div>
                  ))}
                </div>
              )}
              {errors.destinationName && (
                <p className="text-red-500 text-sm mt-1">{errors.destinationName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Optional: Add some notes about this destination"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <input
                type="text"
                name="estimatedBudget"
                value={formData.estimatedBudget}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.estimatedBudget ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Optional: Enter estimated budget"
              />
              {errors.estimatedBudget && (
                <p className="text-red-500 text-sm mt-1">{errors.estimatedBudget}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Season
              </label>
              <select
                name="preferredSeason"
                value={formData.preferredSeason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="winter">Winter</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="autumn">Autumn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <div className="relative">
              <input
                type="text"
                name="daysRequired"
                value={formData.daysRequired}
                onChange={handleChange}
                placeholder="e.g., 2 weeks, 3-4 days, around 5 days"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {daysHint && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {daysHint}
                </div>
              )}
            </div>
          </div>

          {/* Hidden fields for min_days and max_days */}
          <input type="hidden" name="min_days" value={formData.min_days} />
          <input type="hidden" name="max_days" value={formData.max_days} />

          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
              {isLoadingSuggestions && <span className="ml-2 text-sm text-gray-500">(Loading suggestions...)</span>}
            </label>
            <input
              type="text"
              value={currentTagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Type to add tags (comma-separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {tagSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1">
                {tagSuggestions.map((tag, index) => (
                  <div
                    key={tag}
                    className={`px-3 py-2 cursor-pointer ${
                      index === selectedSuggestionIndex 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleTagSuggestionClick(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
            {formData.tags && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.split(',').map((tag, index) => (
                  tag.trim() && (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag.trim()}
                      <button
                        type="button"
                        onClick={() => {
                          const tags = formData.tags.split(',')
                            .map(t => t.trim())
                            .filter((_, i) => i !== index)
                            .join(', ');
                          setFormData(prev => ({ ...prev, tags }));
                        }}
                        className="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove tag</span>
                        ×
                      </button>
                    </span>
                  )
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {initialData ? 'Save Changes' : 'Add Destination'}
            </button>
          </div>
          {errors.submit && (
            <div className="mt-2 text-sm text-red-600">
              {errors.submit}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DestinationForm;
