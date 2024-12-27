import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { versionInfo } from '../utils/version';
import DataTransfer from './DataTransfer';

const Header = () => {
  const { user, login, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const UserAvatar = () => {
    if (user?.photoURL) {
      return (
        <img
          src={user.photoURL}
          alt={user.displayName || 'User avatar'}
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
          }}
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white">
        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
      </div>
    );
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">AddnTravel</Link>
          <span className="ml-4 text-sm opacity-75">{versionInfo.formatted}</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserAvatar />
                <span className="text-sm font-medium mr-1">{user.displayName || user.email}</span>
                <span className="material-symbols-outlined text-sm">
                  {isDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 text-gray-700 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      onClick={() => document.getElementById('import-input')?.click()}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-gray-400">download</span>
                      Import Data
                    </button>
                    <button 
                      onClick={() => document.getElementById('export-button')?.click()}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-gray-400">upload</span>
                      Export Data
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={login}
              className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c2.118,0,3.536-1.418,3.536-3.536v-0.318c0-2.118-1.418-3.536-3.536-3.536h-3.536c-1.054,0-1.909,0.855-1.909,1.909v0.318c0,1.054,0.855,1.909,1.909,1.909h3.536" />
                <path d="M8.364,12.151L8.364,12.151c0-1.054-0.855-1.909-1.909-1.909H2.918c-2.118,0-3.536,1.418-3.536,3.536v0.318c0,2.118,1.418,3.536,3.536,3.536h3.536c1.054,0,1.909-0.855,1.909-1.909v-0.318c0-1.054-0.855-1.909-1.909-1.909H2.918" />
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>
      <DataTransfer />
    </header>
  );
};

export default Header;
