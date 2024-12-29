import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Destination, TravelPeriod } from '../types/destination';

const TRAVEL_PERIODS: TravelPeriod[] = [
  {
    label: 'Weekend Trip',
    minDays: 1,
    maxDays: 3
  },
  {
    label: 'Short Getaway',
    minDays: 3,
    maxDays: 5
  },
  {
    label: 'Weeklong Escape',
    minDays: 5,
    maxDays: 7
  },
  {
    label: 'Leisure Week',
    minDays: 7,
    maxDays: 9
  },
  {
    label: 'Two-Week Retreat',
    minDays: 12,
    maxDays: 16
  },
  {
    label: 'Grand Adventure',
    minDays: 19,
    maxDays: 23
  },
  {
    label: 'Full Sojourn',
    minDays: 25,
    maxDays: 35
  }
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
}

interface FormErrors {
  [key: string]: string;
}

interface DestinationFormProps {
  destination?: Destination;
  onSubmit: (data: Omit<Destination, 'id'>) => void;
  onCancel: () => void;
}

const DestinationForm: React.FC<DestinationFormProps> = ({
  destination,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    destinationName: '',
    description: '',
    estimatedBudget: undefined,
    preferredSeasons: [],
    daysRequired: undefined,
    tags: [],
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [allTags] = useState(['travel', 'food', 'culture', 'nature', 'adventure']);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const extractTagsFromDescription = (text: string): string[] => {
    const tagRegex = /#[\w-]+/g;
    const matches = text.match(tagRegex) || [];
    // Get unique tags by converting to Set and back to array
    return Array.from(new Set(matches.map(tag => tag.slice(1))));
  };

  const initialFormData = useMemo(() => ({
    destinationName: destination?.name || '',
    description: destination?.description || '',
    estimatedBudget: destination?.estimatedBudget,
    preferredSeasons: destination?.preferredSeasons || [],
    daysRequired: destination?.daysRequired || undefined,
    tags: destination?.tags || [],
  }), [destination]);

  useEffect(() => {
    if (destination) {
      setFormData(initialFormData);
    }
  }, [destination, initialFormData]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []); // Empty dependency array since we only want this on mount

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const season = checkbox.value;
      
      setFormData(prev => ({
        ...prev,
        preferredSeasons: checkbox.checked
          ? [...prev.preferredSeasons, season]
          : prev.preferredSeasons.filter(s => s !== season)
      }));
    } else if (name === 'description') {
      const extractedTags = extractTagsFromDescription(value);
      setFormData(prev => ({
        ...prev,
        description: value,
        tags: extractedTags
      }));

      // Handle tag suggestions
      const lastHashIndex = value.lastIndexOf('#');
      if (lastHashIndex !== -1) {
        const textAfterHash = value.slice(lastHashIndex + 1);
        const currentWord = textAfterHash.split(/\s/)[0]; // Get the word being typed
        
        if (currentWord !== '') {
          // Filter suggestions based on current input and exclude already used tags
          const filteredSuggestions = allTags
            .filter(tag => 
              tag.toLowerCase().includes(currentWord.toLowerCase()) && 
              !extractedTags.includes(tag)
            );
          setTagSuggestions(filteredSuggestions);
        } else {
          // Show only unused tags
          setTagSuggestions(allTags.filter(tag => !extractedTags.includes(tag)));
        }
        setShowTagSuggestions(true);
        setSelectedTagIndex(0);
      } else {
        setShowTagSuggestions(false);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'estimatedBudget' ? Number(value) : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showTagSuggestions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedTagIndex(prev => 
            prev < tagSuggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedTagIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (tagSuggestions[selectedTagIndex]) {
            handleTagSelect(tagSuggestions[selectedTagIndex]);
          }
          break;
        case 'Escape':
          setShowTagSuggestions(false);
          break;
      }
    }
  };

  const handleTagSelect = (tag: string) => {
    if (descriptionRef.current) {
      const cursorPosition = descriptionRef.current.selectionStart;
      const text = formData.description;
      const lastHashIndex = text.lastIndexOf('#', cursorPosition);
      const partBeforeHash = text.substring(0, lastHashIndex);
      const partAfterCursor = text.substring(cursorPosition);
      const newText = `${partBeforeHash}#${tag} ${partAfterCursor}`;
      
      setFormData(prev => ({
        ...prev,
        description: newText,
        tags: extractTagsFromDescription(newText)
      }));
      setShowTagSuggestions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.destinationName.trim()) {
      newErrors.destinationName = 'Destination name is required';
    }

    if (formData.estimatedBudget && formData.estimatedBudget < 0) {
      newErrors.estimatedBudget = 'Budget cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submissionData: Omit<Destination, 'id'> = {
        name: formData.destinationName.trim(),
        description: formData.description.trim(),
        estimatedBudget: formData.estimatedBudget,
        preferredSeasons: formData.preferredSeasons,
        daysRequired: formData.daysRequired,
        tags: formData.tags,
        createdAt: new Date().toISOString(),
      };
      
      onSubmit(submissionData);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      onCancel();
    }
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCancelModal) {
          setShowCancelModal(false);
        } else {
          handleCancel();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCancelModal, hasChanges]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white w-full md:rounded-2xl md:w-auto md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">
              Destination Name*
            </label>
            <input
              ref={nameInputRef}
              type="text"
              name="destinationName"
              value={formData.destinationName}
              onChange={handleInputChange}
              className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border border-gray-200 text-gray-900 text-base md:text-lg placeholder:text-gray-400"
              placeholder="e.g., Paris, France"
              required
            />
            {errors.destinationName && (
              <p className="mt-1 text-red-500 text-sm">{errors.destinationName}</p>
            )}
          </div>

          <div>
            <label className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">
              Description
            </label>
            <div className="relative">
              <textarea
                ref={descriptionRef}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full px-3 md:px-4 py-2 rounded-lg border border-gray-200 text-gray-900 text-sm md:text-base placeholder:text-gray-400"
                rows={3}
                placeholder="Add description and use #tags"
              />
              {showTagSuggestions && (
                <div className="absolute bottom-full left-0 w-full bg-white border rounded shadow-lg max-h-32 overflow-y-auto">
                  {tagSuggestions.map((tag, index) => (
                    <div
                      key={tag}
                      className={`px-3 py-1.5 cursor-pointer text-sm ${
                        index === selectedTagIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleTagSelect(tag)}
                    >
                      #{tag}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {formData.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs md:text-sm font-medium bg-blue-100 text-blue-800">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">
              Estimated Budget (USD)
            </label>
            <div className="space-y-2 md:space-y-4">
              <input
                type="range"
                name="estimatedBudget"
                min={MIN_BUDGET}
                max={MAX_BUDGET}
                step={BUDGET_STEP}
                value={formData.estimatedBudget ?? MIN_BUDGET}
                onChange={handleInputChange}
                className="w-full h-1.5 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs md:text-sm text-gray-600">
                <span>${MIN_BUDGET}</span>
                <span className="font-medium text-sm md:text-lg text-blue-700">
                  {typeof formData.estimatedBudget === 'number'
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }).format(formData.estimatedBudget)
                    : '-'}
                </span>
                <span>${MAX_BUDGET}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">
              Preferred Seasons
            </label>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {['Any', 'Spring', 'Summer', 'Fall', 'Winter'].map((season) => {
                const isSelected = season === 'Any' 
                  ? formData.preferredSeasons.length === 0 
                  : formData.preferredSeasons.includes(season);
                
                return (
                  <button
                    key={season}
                    type="button"
                    onClick={() => {
                      if (season === 'Any') {
                        setFormData(prev => ({
                          ...prev,
                          preferredSeasons: []
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          preferredSeasons: isSelected
                            ? prev.preferredSeasons.filter(s => s !== season)
                            : [...prev.preferredSeasons, season]
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
            <label className="block text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">
              Travel Period
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TRAVEL_PERIODS.map((period) => (
                <button
                  key={period.label}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      daysRequired: prev.daysRequired?.label === period.label ? undefined : period
                    }));
                  }}
                  className={`p-2 md:p-3 rounded-lg text-xs md:text-sm font-medium text-center transition-colors ${
                    formData.daysRequired?.label === period.label
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div>{period.label}</div>
                  <div className="text-xs text-gray-500">{period.minDays}-{period.maxDays} days</div>
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

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium mb-4">Discard Changes?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to discard your changes?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Keep Editing
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  onCancel();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationForm;
