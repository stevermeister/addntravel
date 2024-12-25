import React, { useState, useEffect, useCallback } from 'react';
import { parseDatePeriod } from '../utils/dateParser';
import debounce from 'lodash/debounce';
import { getSuggestedTags, correctTagSpelling, getLocalTagSuggestions } from '../utils/tagHelper';
import { destinations } from '../data/destinations';

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

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        destinationName: initialData.destinationName || initialData.name || '',
        tags: initialData.tags.join(', '),
        estimatedBudget: initialData.estimatedBudget.toString(),
        min_days: initialData.min_days || 0,
        max_days: initialData.max_days || 0,
        destinationSelected: true
      });
      // Clear any existing tag suggestions when editing
      setTagSuggestions([]);
      setCurrentTagInput('');
    }
  }, [initialData]);

  // Get tag suggestions when location changes
  useEffect(() => {
    if (formData.destinationName && formData.destinationSelected && currentTagInput) {
      const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        const suggestions = await getSuggestedTags(formData.destinationName, currentTags);
        setTagSuggestions(suggestions);
        setIsLoadingSuggestions(false);
      };
      fetchSuggestions();
    } else {
      setTagSuggestions([]);
    }
  }, [formData.destinationName, formData.destinationSelected, currentTagInput]);

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
    if (!formData.destinationName) newErrors.destinationName = 'Destination name is required';
    if (formData.estimatedBudget && isNaN(formData.estimatedBudget)) {
      newErrors.estimatedBudget = 'Budget must be a number';
    }
    if (formData.daysRequired && isNaN(formData.daysRequired)) {
      newErrors.daysRequired = 'Days must be a number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag);

      try {
        // Parse days required into min_days and max_days
        const { min_days, max_days } = await parseDatePeriod(formData.daysRequired);
        console.log('Parsed days:', { min_days, max_days });

        const submissionData = {
          ...formData,
          id: initialData?.id || Date.now().toString(),
          estimatedBudget: Number(formData.estimatedBudget),
          tags: tagsArray,
          min_days,
          max_days,
          status: 'wishlist'
        };

        await onSubmit(submissionData);
        onClose();
      } catch (error) {
        console.error('Error processing form:', error);
        setErrors(prev => ({
          ...prev,
          daysRequired: 'Error processing days required'
        }));
      }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'destinationName' ? { destinationSelected: false } : {})
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Update days hint when daysRequired field changes
    if (name === 'daysRequired') {
      updateDaysHint(value);
    }
  };

  // Handle tag input changes with local suggestions
  const handleTagInputChange = (e) => {
    const input = e.target.value;
    setCurrentTagInput(input);
    
    if (input.endsWith(',')) {
      // Add the tag when comma is typed
      const newTag = input.slice(0, -1).trim();
      if (newTag) {
        handleAddTag(newTag);
      }
      setCurrentTagInput('');
      setTagSuggestions([]); // Clear suggestions after adding tag
    } else if (input.trim() && !initialData?.id) { // Only show suggestions if not editing
      // Only show suggestions if there's non-empty input
      const suggestions = getLocalTagSuggestions(input);
      setTagSuggestions(suggestions);
    } else {
      setTagSuggestions([]); // Clear suggestions if input is empty or editing
    }
  };

  // Handle adding a new tag
  const handleAddTag = async (tag) => {
    const correctedTag = await correctTagSpelling(tag);
    const tagToAdd = correctedTag || tag;
    
    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (!currentTags.includes(tagToAdd)) {
      setFormData(prev => ({
        ...prev,
        tags: [...currentTags, tagToAdd].join(', ')
      }));
    }
    setTagSuggestions([]); // Clear suggestions after adding tag
  };

  // Handle selecting a suggestion
  const handleSuggestionClick = (tag) => {
    handleAddTag(tag);
    setCurrentTagInput('');
    setTagSuggestions([]);
  };

  // Handle keyboard navigation
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && tagSuggestions.length > 0) {
        handleSuggestionClick(tagSuggestions[selectedSuggestionIndex]);
      } else if (currentTagInput.trim()) {
        handleAddTag(currentTagInput.trim());
        setCurrentTagInput('');
      }
      setTagSuggestions([]); // Clear suggestions after adding tag
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
          handleSuggestionClick(tagSuggestions[index]);
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
    if (destinationSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedDestinationIndex(prev => 
          prev < destinationSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedDestinationIndex(prev => 
          prev > 0 ? prev - 1 : destinationSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedDestinationIndex >= 0) {
          handleDestinationSelect(destinationSuggestions[selectedDestinationIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setDestinationSuggestions([]);
        break;
      default:
        break;
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{initialData ? 'Edit' : 'Add New'} Destination</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Tags
              {isLoadingSuggestions && <span className="ml-2 text-sm text-gray-500">(Loading suggestions...)</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentTagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Type to add tags (comma-separated)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                aria-label="Tag input"
                aria-expanded={tagSuggestions.length > 0}
                aria-activedescendant={selectedSuggestionIndex >= 0 ? `tag-suggestion-${selectedSuggestionIndex}` : undefined}
                role="combobox"
              />
              {tagSuggestions.length > 0 && (
                <div 
                  className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200"
                  role="listbox"
                >
                  {tagSuggestions.map((tag, index) => (
                    <div
                      id={`tag-suggestion-${index}`}
                      key={index}
                      onClick={() => handleSuggestionClick(tag)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      className={`px-4 py-2 cursor-pointer text-sm ${
                        index === selectedSuggestionIndex 
                          ? 'bg-indigo-100 text-indigo-900' 
                          : 'hover:bg-gray-100'
                      }`}
                      role="option"
                      aria-selected={index === selectedSuggestionIndex}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              {initialData ? 'Save Changes' : 'Add Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DestinationForm;
