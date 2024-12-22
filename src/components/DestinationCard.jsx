import React, { useState } from 'react';

const getCityImage = (cityName) => {
  // Default fallback image
  const defaultImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
  
  // Fallback images for specific cities
  const cityImages = {
    'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    'Tokyo': 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8',
    'New York': 'https://images.unsplash.com/photo-1522083165195-3424ed129620',
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    'Barcelona': 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216',
    'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017',
    'Venice': 'https://images.unsplash.com/photo-1513805959324-96eb66ca8713',
    'Prague': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0',
    'Santorini': 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e'
  };

  if (!cityName) return defaultImage;
  
  // Extract city name before any comma or dash
  const mainCity = cityName.split(/[,\-]/)[0].trim();
  return cityImages[mainCity] || defaultImage;
};

const DestinationCard = ({ destination, onDelete, onEdit }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(destination.imageUrl || getCityImage(destination.name));

  const handleImageError = () => {
    const fallbackUrl = getCityImage(destination.name);
    if (imageUrl !== fallbackUrl) {
      setImageUrl(fallbackUrl);
    }
  };

  const formatBudget = (budget) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(budget);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2">
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
            {destination.preferredSeason || 'All'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col min-h-[200px]">
        {/* Main Content */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{destination.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{destination.description}</p>

          {/* Tags */}
          <div className="mb-4 min-h-[24px]">
            {destination.tags && destination.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {destination.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
            {/* Budget */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate">{formatBudget(destination.estimatedBudget)}</span>
            </div>

            {/* Days */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{destination.daysRequired || 'Not specified'}</span>
            </div>

            {/* Season */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="truncate capitalize">
                {destination.preferredSeason || 'All'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 mt-auto border-t border-gray-100">
          <button
            onClick={() => onEdit(destination)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete destination"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Destination</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{destination.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(destination.id);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationCard;
