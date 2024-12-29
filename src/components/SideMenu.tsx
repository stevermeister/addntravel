import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { exportWishlistData, importWishlistData } from '../utils/dataManager';
import { ref, remove } from 'firebase/database';
import { database } from '../utils/firebase';

const SideMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSideMenuOpen, setIsSideMenuOpen } = useUI();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsSideMenuOpen(false);
      }
    };

    if (isSideMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSideMenuOpen, setIsSideMenuOpen]);

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await exportWishlistData();
      setIsSideMenuOpen(false);
    } catch (err) {
      setError('Failed to create backup');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      await importWishlistData(file);
      setIsSideMenuOpen(false);
    } catch (err) {
      setError('Failed to restore backup. Please check the file format.');
      console.error(err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAllDestinations = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      setError(null);
      const destinationsRef = ref(database, `users/${user.uid}/destinations`);
      await remove(destinationsRef);
      setShowConfirmModal(false);
      setIsSideMenuOpen(false);
    } catch (err) {
      setError('Failed to remove destinations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSideMenuOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSideMenuOpen(false)} />
      <div
        ref={menuRef}
        className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out"
        style={{ transform: isSideMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User avatar'}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                {(user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="font-medium">{user?.displayName || 'User'}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="py-2">
          <Link
            to="/wishlist"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            onClick={() => setIsSideMenuOpen(false)}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            My Wishlist
          </Link>

          <button
            onClick={handleCreateBackup}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Create Backup
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Restore Backup
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-red-600"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove All Destinations
          </button>

          <div className="border-t border-gray-200 my-2"></div>

          <button
            onClick={() => {
              logout();
              setIsSideMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleRestoreBackup}
        />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Remove All Destinations</h3>
            <p className="mb-6">Are you sure you want to remove all destinations? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAllDestinations}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </>
  );
};

export default SideMenu;