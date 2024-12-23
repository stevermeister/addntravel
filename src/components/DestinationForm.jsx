import React, { useState, useEffect, useCallback } from 'react';
import { parseDatePeriod } from '../utils/dateParser';
import debounce from 'lodash/debounce';

const DestinationForm = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedBudget: '',
    preferredSeason: '', // Empty string will show as 'All'
    daysRequired: '',
    min_days: 0,
    max_days: 0,
    tags: '',
    imageUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [daysHint, setDaysHint] = useState('');

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tags: initialData.tags.join(', '),
        estimatedBudget: initialData.estimatedBudget.toString(),
        min_days: initialData.min_days || 0,
        max_days: initialData.max_days || 0
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.estimatedBudget) newErrors.estimatedBudget = 'Budget is required';
    if (formData.estimatedBudget && isNaN(formData.estimatedBudget)) {
      newErrors.estimatedBudget = 'Budget must be a number';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length === 0) {
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
    } else {
      setErrors(newErrors);
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
      [name]: value
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
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (USD)*
              </label>
              <input
                type="number"
                name="estimatedBudget"
                value={formData.estimatedBudget}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.estimatedBudget ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., beach, culture, hiking"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
