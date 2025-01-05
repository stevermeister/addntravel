import React, { useState, useEffect, useRef } from 'react';

interface SearchOverlayProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({
  searchValue,
  onSearchChange,
  isVisible,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchMove, setTouchMove] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const quickFilters = ['Beach', 'Mountain', 'City', 'Nature', 'Historical', 'Adventure'];
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      setTranslateY(0);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    e.preventDefault(); // Prevent default touch behavior
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    if (touchStart === null) return;

    const currentTouch = e.targetTouches[0].clientY;
    setTouchMove(currentTouch);

    const diff = currentTouch - touchStart;
    if (diff > 0) {
      // Only allow downward swipe
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    if (touchStart === null || touchMove === null) return;

    const diff = touchMove - touchStart;
    const threshold = 100; // Minimum distance to trigger close

    if (diff > threshold) {
      handleClose();
    } else {
      setTranslateY(0);
    }

    setTouchStart(null);
    setTouchMove(null);
  };

  const handleQuickFilterClick = (filter: string) => {
    onSearchChange(filter.toLowerCase());
  };

  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);
      setTranslateY(0);
    }
  }, [isVisible]);

  if (!isVisible && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <button
        onClick={handleClose}
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        aria-label="Close search overlay"
      />

      {/* Search Panel */}
      <div
        ref={panelRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
          transition: touchStart ? 'none' : 'transform 0.3s ease-out',
          touchAction: 'none',
        }}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Handle */}
        <button
          onClick={handleClose}
          className="w-full flex justify-center pt-4 pb-2"
          aria-label="Close search overlay"
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300" />
        </button>

        {/* Search Header */}
        <div className="px-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Search Destinations</h2>
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Type to search..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-base placeholder:text-gray-400 
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="px-4 pb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleQuickFilterClick(filter)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
