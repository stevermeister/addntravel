import React, { useState, useEffect } from 'react';
import { Destination } from '../types/destination';

interface CityImages {
  [key: string]: string;
}

const getCityImage = (cityName: string): string => {
  // Default fallback image
  const defaultImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
  
  // Fallback images for specific cities
  const cityImages: CityImages = {
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

interface DestinationCardProps {
  destination: Destination;
  onDelete: () => void;
  onEdit: (updates: Partial<Destination>) => void;
  onTagClick?: (tag: string) => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ 
  destination, 
  onDelete, 
  onEdit,
  onTagClick 
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>(destination.imageUrl || getCityImage(destination.name));

  // Update image URL when destination changes
  useEffect(() => {
    setImageUrl(destination.imageUrl || getCityImage(destination.name));
  }, [destination.imageUrl, destination.name]);

  const handleImageError = () => {
    const fallbackUrl = getCityImage(destination.name);
    if (imageUrl !== fallbackUrl) {
      setImageUrl(fallbackUrl);
    }
  };

  const formatBudget = (budget: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(budget);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden group">
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={destination.name}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit(destination)}
            className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {/* Seasons - Left Top */}
        {destination.preferredSeasons && Array.isArray(destination.preferredSeasons) && destination.preferredSeasons.length > 0 && (
          <div className="absolute top-2 left-2">
            <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-sm">
              {destination.preferredSeasons.join(', ')}
            </span>
          </div>
        )}

        {/* Budget - Right Top */}
        {destination.estimatedBudget && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-sm">
              {formatBudget(destination.estimatedBudget)}
            </span>
          </div>
        )}

        {/* Period - Middle Bottom */}
        {destination.daysRequired && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-sm whitespace-nowrap">
              {destination.daysRequired.label}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{destination.name}</h3>
        {destination.description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{destination.description}</p>
        )}
        {/* Tags below description */}
        {destination.tags && destination.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {destination.tags.map((tag, index) => (
              <span
                key={index}
                onClick={() => onTagClick?.(tag)}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Destination</h3>
            <p className="mb-6">Are you sure you want to delete {destination.name}?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
