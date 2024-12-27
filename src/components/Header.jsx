import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { versionInfo } from '../utils/version';
import { exportWishlistData, importWishlistData } from '../utils/dataManager';

const Header = () => {
  const { user, login, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importWishlistData(file);
      alert('Data imported successfully!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please check the file format and try again.');
    }
  };

  const handleExport = async () => {
    try {
      await exportWishlistData();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

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

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/', { replace: true });
  };

  return (
    <header className="bg-blue-600 text-white shadow-md relative z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold" onClick={handleLogoClick}>AddnTravel</Link>
          
          <div className="flex items-center">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserAvatar />
                  <span className="text-sm font-medium mr-1 hidden sm:inline">{user.displayName || user.email}</span>
                  <span className="material-symbols-outlined text-sm">
                    {isDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 sm:w-48 bg-white rounded-lg shadow-lg py-1 text-gray-700 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900 truncate">{user.displayName}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                    
                    <div className="py-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".json"
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-gray-400">download</span>
                        Import Data
                      </button>
                      <button 
                        onClick={handleExport}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
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
                        className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-gray-50 flex items-center gap-2"
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
                <span className="material-symbols-outlined">login</span>
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
