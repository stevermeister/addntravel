import React, { useRef, useState, useEffect } from 'react';
import { exportWishlistData, importWishlistData } from '../utils/dataManager';
import { ref, remove } from 'firebase/database';
import { database, auth } from '../utils/firebase';

interface SettingsMenuProps {
  onDataChange: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onDataChange }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuItems = ['Create Backup', 'Restore Backup', 'Remove All Destinations'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => (prev + 1) % menuItems.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex === 0) {
            handleCreateBackup();
          } else if (selectedIndex === 1) {
            fileInputRef.current?.click();
          } else if (selectedIndex === 2) {
            setShowConfirmModal(true);
          }
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedIndex]);

  const handleCreateBackup = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await exportWishlistData();
      setIsOpen(false);
    } catch (err) {
      setError('Failed to create backup');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      await importWishlistData(file);
      onDataChange();
      setIsOpen(false);
    } catch (err) {
      setError('Failed to restore backup. Please check the file format.');
      console.error(err);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAllDestinations = async (): Promise<void> => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const destinationsRef = ref(database, `users/${userId}/destinations`);
      await remove(destinationsRef);
      onDataChange();
      setShowConfirmModal(false);
      setIsOpen(false);
    } catch (err) {
      setError('Failed to remove destinations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSelectedIndex(0);
        }}
        className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        aria-label="Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={item}
                onClick={() => {
                  if (index === 0) handleCreateBackup();
                  else if (index === 1) fileInputRef.current?.click();
                  else if (index === 2) setShowConfirmModal(true);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  selectedIndex === index
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${item === 'Remove All Destinations' ? 'text-red-600 hover:text-red-700' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleRestoreBackup}
        accept=".json"
        className="hidden"
      />

      {error && (
        <div className="absolute right-0 mt-2 w-56 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium mb-4">Remove All Destinations</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all destinations? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAllDestinations}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Removing...' : 'Remove All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
