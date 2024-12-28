import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Destination } from '../types/destination';

interface FormData {
  destinationName: string;
  description: string;
  estimatedBudget?: number;
  preferredSeasons: string[];
  daysRequired?: string;
  tags: string;
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
    daysRequired: '',
    tags: '',
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  const initialFormData = useMemo(() => ({
    destinationName: destination?.name || '',
    description: destination?.description || '',
    estimatedBudget: destination?.estimatedBudget,
    preferredSeasons: destination?.preferredSeasons || [],
    daysRequired: destination?.daysRequired || '',
    tags: destination?.tags?.join(', ') || '',
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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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
    
    if (!validateForm()) return;

    const destinationData: Omit<Destination, 'id'> = {
      name: formData.destinationName,
      description: formData.description,
      estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : undefined,
      preferredSeasons: formData.preferredSeasons,
      daysRequired: formData.daysRequired || undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    onSubmit(destinationData);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {destination ? 'Edit Destination' : 'Add New Destination'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-2">
                Destination Name*
              </label>
              <input
                ref={nameInputRef}
                type="text"
                name="destinationName"
                value={formData.destinationName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-lg placeholder:text-gray-400"
                placeholder="e.g., Paris, France"
                required
              />
              {errors.destinationName && (
                <p className="mt-1 text-red-500">{errors.destinationName}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-lg placeholder:text-gray-400"
                placeholder="Mention why this destination interests you or what activities you'd like to do..."
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-2">
                Estimated Budget (USD)
              </label>
              <input
                type="number"
                name="estimatedBudget"
                value={formData.estimatedBudget || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-lg placeholder:text-gray-400"
                placeholder="e.g., 1000"
              />
              {errors.estimatedBudget && (
                <p className="mt-1 text-red-500">{errors.estimatedBudget}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-2">
                Preferred Seasons
              </label>
              <div className="flex flex-wrap gap-2">
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
                          setFormData(prev => {
                            const newSeasons = isSelected
                              ? prev.preferredSeasons.filter(s => s !== season)
                              : [...prev.preferredSeasons, season];
                            return {
                              ...prev,
                              preferredSeasons: newSeasons
                            };
                          });
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                        ${isSelected 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {season}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-2">
                Days Required
              </label>
              <input
                type="text"
                name="daysRequired"
                value={formData.daysRequired}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-lg placeholder:text-gray-400"
                placeholder="e.g., 3-5 or 7"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-lg placeholder:text-gray-400"
                placeholder="e.g., beach, culture, food (comma separated)"
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Discard Changes?</h3>
            <p className="mb-6">You have unsaved changes. Are you sure you want to cancel?</p>
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
