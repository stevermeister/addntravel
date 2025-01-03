import React, { useState } from 'react';
import { Destination } from '../types/destination';
import ActionPanel from './ActionPanel';

interface DestinationCardProps {
  destination: Destination;
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
  onTagClick?: (tag: string) => void;
}

const formatBudget = (budget: string | number): string => {
  if (typeof budget === 'string') return budget;
  return `$${budget}`;
};

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onEdit,
  onDelete,
  onTagClick,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(destination.imageUrl);

  const handleCardClick = () => {
    // Only show actions on mobile
    if (window.innerWidth < 768) {
      setShowActions(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleCardClick();
    }
  };

  const handleImageError = () => {
    if (imageUrl !== destination.imageUrl) {
      setImageUrl(destination.imageUrl);
    }
  };

  const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        className="w-full text-left group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`View details for ${destination.name}`}
      >
        {/* Image */}
        <div className="relative h-48">
          <img
            src={imageUrl}
            alt={destination.name}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />

          {/* Information Labels */}
          {/* Seasons - Left Top */}
          {destination.preferredSeasons && destination.preferredSeasons.length > 0 && (
            <div className="absolute top-2 left-2">
              <span className="text-xs md:text-sm bg-black/50 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-lg backdrop-blur-sm">
                {destination.preferredSeasons.join(', ')}
              </span>
            </div>
          )}

          {/* Budget - Right Top */}
          {destination.estimatedBudget && (
            <div className="absolute top-2 right-2 hidden md:block">
              <span className="text-xs md:text-sm bg-black/50 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-lg backdrop-blur-sm">
                {formatBudget(destination.estimatedBudget)}
              </span>
            </div>
          )}

          {/* Period - Middle Bottom */}
          {destination.daysRequired && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <span className="text-xs md:text-sm bg-black/50 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-lg backdrop-blur-sm whitespace-nowrap">
                {typeof destination.daysRequired === 'string'
                  ? destination.daysRequired
                  : destination.daysRequired.label}
              </span>
            </div>
          )}

          {/* Desktop Actions - Only visible on hover */}
          <div
            className="absolute top-2 right-2 hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={stopPropagation}
            onKeyDown={stopPropagation}
            role="toolbar"
            aria-label="Destination actions"
          >
            <div
              onClick={() => onEdit(destination)}
              className="p-2 bg-white/90 rounded-full text-gray-600 hover:text-gray-900 shadow-sm hover:bg-white cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onEdit(destination);
                }
              }}
              aria-label="Edit destination"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div
              onClick={() => setShowDeleteModal(true)}
              className="p-2 bg-white/90 rounded-full text-gray-600 hover:text-red-600 shadow-sm hover:bg-white cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowDeleteModal(true);
                }
              }}
              aria-label="Delete destination"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{destination.name}</h3>
          {destination.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{destination.description}</p>
          )}
          {destination.tags && destination.tags.length > 0 && (
            <div
              className="flex flex-wrap gap-1 mt-2"
              onClick={stopPropagation}
              onKeyDown={stopPropagation}
              role="toolbar"
              aria-label="Destination tags"
            >
              {destination.tags.map((tag) => (
                <div
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className="inline-block px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onTagClick?.(tag);
                    }
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Action Panel */}
      <ActionPanel
        isVisible={showActions}
        onClose={() => setShowActions(false)}
        onEdit={() => onEdit(destination)}
        onDelete={() => onDelete(destination)}
        destinationName={destination.name}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-2">Delete Destination</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete &ldquo;{destination.name}&rdquo;? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(destination);
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DestinationCard;
