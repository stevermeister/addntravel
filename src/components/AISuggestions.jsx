import React from 'react';

const AISuggestions = ({ suggestions, onAddToWishlist, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Getting AI suggestions...</span>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          AI-Suggested Destinations
        </h3>
        <span className="text-sm text-gray-500">
          {suggestions.length} suggestions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="relative h-40 mb-4">
              <img
                src={suggestion.imageUrl}
                alt={suggestion.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                {Math.round(suggestion.confidence * 100)}% Match
              </div>
            </div>

            <h4 className="font-semibold text-gray-800 mb-2">{suggestion.name}</h4>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {suggestion.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {suggestion.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>${suggestion.estimatedBudget}</span>
              <span>{suggestion.daysRequired} days</span>
              <span className="capitalize">{suggestion.preferredSeason}</span>
            </div>

            <button
              onClick={() => onAddToWishlist(suggestion)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
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
