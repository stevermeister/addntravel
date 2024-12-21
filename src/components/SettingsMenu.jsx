import React, { useRef, useState } from 'react';
import { exportWishlistData, importWishlistData, createBackup, restoreFromBackup } from '../utils/dataManager';

const SettingsMenu = ({ onDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await exportWishlistData();
    } catch (err) {
      setError('Failed to export data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      await importWishlistData(file);
      onDataChange();
      setIsOpen(false);
    } catch (err) {
      setError('Failed to import data. Please check the file format.');
      console.error(err);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await createBackup();
      setError('Backup created successfully');
    } catch (err) {
      setError('Failed to create backup');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await restoreFromBackup();
      onDataChange();
      setIsOpen(false);
    } catch (err) {
      setError('Failed to restore from backup');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Export Data
            </button>
            
            <label className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
              Import Data
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleBackup}
              disabled={isLoading}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Create Backup
            </button>
            
            <button
              onClick={handleRestore}
              disabled={isLoading}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Restore Backup
            </button>
          </div>

          {error && (
            <div className="px-4 py-2 text-sm text-red-600 bg-red-50">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="px-4 py-2 text-sm text-gray-500">
              <div className="loading-spinner"></div>
              Processing...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
