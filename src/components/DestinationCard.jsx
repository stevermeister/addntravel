import React from 'react';

const DestinationCard = ({ destination }) => {
  const { 
    name, 
    description, 
    tags, 
    estimatedBudget, 
    preferredSeason, 
    imageUrl,
    daysRequired = '7-10' // Default value if not provided
  } = destination;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          className="h-48 w-full object-cover" 
          src={imageUrl} 
          alt={name}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
          }}
        />
        <div className="absolute top-0 right-0 p-2">
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
            {preferredSeason}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-gray-900">{name}</h2>
          <span className="text-green-600 font-semibold">
            ${estimatedBudget}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg className="h-5 w-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span>{daysRequired} days recommended</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button 
            className="text-blue-500 hover:text-blue-700 font-medium text-sm focus:outline-none"
            onClick={() => console.log('Edit clicked', name)}
          >
            Edit Details
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
            onClick={() => console.log('View Details clicked', name)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
