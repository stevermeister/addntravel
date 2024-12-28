import React, { useState, useEffect } from 'react';
import { Destination } from '../types/destination';

interface FormData {
  destinationName: string;
  description: string;
  estimatedBudget?: number;
  preferredSeason?: string;
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
    preferredSeason: '',
    daysRequired: '',
    tags: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (destination) {
      setFormData({
        destinationName: destination.name,
        description: destination.description || '',
        estimatedBudget: destination.estimatedBudget,
        preferredSeason: destination.preferredSeason || '',
        daysRequired: destination.daysRequired || '',
        tags: destination.tags?.join(', ') || '',
      });
    }
  }, [destination]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      preferredSeason: formData.preferredSeason || undefined,
      daysRequired: formData.daysRequired || undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    onSubmit(destinationData);
  };

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
                placeholder="Add some notes about this destination..."
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
                Preferred Season
              </label>
              <select
                name="preferredSeason"
                value={formData.preferredSeason}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-lg"
              >
                <option value="">Select a season</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
                <option value="Any">Any Season</option>
              </select>
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
                onClick={onCancel}
                className="px-6 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors text-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-lg"
              >
                {destination ? 'Save Changes' : 'Add Destination'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DestinationForm;
