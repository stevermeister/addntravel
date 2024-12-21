import React, { useState } from 'react';

const DestinationCard = ({ destination, onDelete, onEdit }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleDelete = () => {
    onDelete(destination.id);
    setShowDeleteModal(false);
  };

  const formatBudget = (budget) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(budget);
  };

  return (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
        <div className={`absolute inset-0 bg-gray-200 ${!isImageLoaded ? 'animate-pulse' : ''}`} />
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{destination.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{destination.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {destination.tags.map((tag, index) => (
            <span key={index} className="badge badge-blue">
              {tag}
            </span>
          ))}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
          {/* Budget */}
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatBudget(destination.estimatedBudget)}</span>
          </div>

          {/* Days */}
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{destination.daysRequired} days</span>
          </div>

          {/* Season */}
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="capitalize">{destination.preferredSeason}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(destination)}
            className="btn btn-primary flex-1"
          >
            Edit
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
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
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
