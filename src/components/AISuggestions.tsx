import React from 'react';
import { Destination } from '../types/destination';

interface AISuggestionsProps {
  suggestions: Destination[];
  onAddToWishlist: (suggestion: Destination) => void;
  isLoading: boolean;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  suggestions,
  onAddToWishlist,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Getting AI Suggestions...</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!suggestions.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">AI Suggested Destinations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h4 className="font-semibold mb-2">{suggestion.name}</h4>
            {suggestion.description && (
              <p className="text-gray-600 text-sm mb-4">{suggestion.description}</p>
            )}
            <button
              onClick={() => onAddToWishlist(suggestion)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
              Add to Wishlist
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;
