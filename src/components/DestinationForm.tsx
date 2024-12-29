import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
}

interface DestinationFormProps {
  destination?: Destination;
  onSubmit: (data: Omit<Destination, 'id'>) => void;
  onCancel: () => void;
}

const DestinationForm: React.FC<DestinationFormProps> = ({ destination, onSubmit, onCancel }) => {
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

  useEffect(() => {
    if (destination) {
      setFormData(initialFormData);
    }
  }, [destination, initialFormData]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const season = checkbox.value;

      setFormData((prev) => ({
        ...prev,
        preferredSeasons: checkbox.checked
          ? [...prev.preferredSeasons, season]
          : prev.preferredSeasons.filter((s) => s !== season),
      }));
    } else if (name === 'description') {
      const extractedTags = extractTagsFromDescription(value);
      setFormData((prev) => ({
        ...prev,
        description: value,
        tags: extractedTags,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'estimatedBudget' ? Number(value) : value,
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
    // Get unique tags by converting to Set and back to array
    return Array.from(new Set(matches.map((tag) => tag.slice(1))));
  };

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
          <div>
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
              className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border border-gray-200 text-gray-900 text-base md:text-lg placeholder:text-gray-400"
              placeholder="e.g., Paris, France"
              required
            />
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
              Estimated Budget (USD)
            </label>
            <div className="space-y-2 md:space-y-4">
              <input
                id="estimatedBudget"
                type="range"
                name="estimatedBudget"
                min={MIN_BUDGET}
                max={MAX_BUDGET}
                step={BUDGET_STEP}
                value={formData.estimatedBudget ?? MIN_BUDGET}
                onChange={handleInputChange}
                className="w-full h-1.5 md:h-2 bg-gray-200 rounded-lg md:rounded-xl border border-gray-200 text-gray-900 text-base md:text-lg placeholder:text-gray-400"
              />
              <div className="flex justify-between text-xs md:text-sm text-gray-600">
                <span>${MIN_BUDGET}</span>
                <span className="font-medium text-sm md:text-lg text-blue-700">
                  {typeof formData.estimatedBudget === 'number'
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format(formData.estimatedBudget)
                    : '-'}
                </span>
                <span>${MAX_BUDGET}</span>
              </div>
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
};

export default DestinationForm;
