import React from 'react';
import { useLocation } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { setShowAddForm, setShowSearch, setIsCalendarOpen } = useUI();

  const handleAction = (action: 'search' | 'add' | 'calendar') => {
    // Reset all states first
    setShowSearch(false);
    setShowAddForm(false);
    setIsCalendarOpen(false);

    // Then set the requested action
    switch (action) {
      case 'search':
        setShowSearch(true);
        break;
      case 'add':
        setShowAddForm(true);
        break;
      case 'calendar':
        setIsCalendarOpen(true);
        break;
    }
  };

  const isActive = (action: string) => {
    switch (action) {
      case 'search':
        return location.pathname === '/search';
      case 'add':
        return location.pathname === '/add';
      case 'calendar':
        return location.pathname === '/calendar';
      default:
        return false;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-14">
        {/* Search Button */}
        <button
          onClick={() => handleAction('search')}
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('search') ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-xs mt-1">Search</span>
        </button>

        {/* Add Button */}
        <button
          onClick={() => handleAction('add')}
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('add') ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs mt-1">Add</span>
        </button>

        {/* Calendar Button */}
        <button
          onClick={() => handleAction('calendar')}
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('calendar') ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs mt-1">Calendar</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
