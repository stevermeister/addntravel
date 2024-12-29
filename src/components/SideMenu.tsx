import React, { useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { exportWishlistData, importWishlistData } from '../utils/dataManager';
import { ref, remove, get } from 'firebase/database';
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

  const handleRemoveAllDestinations = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    const destinationsRef = ref(database, `users/${user.uid}/destinations`);

    get(destinationsRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          throw new Error('No destinations to remove');
        }
        return remove(destinationsRef);
      })
      .then(() => {
        setShowConfirmModal(false);
        setTimeout(() => setIsSideMenuOpen(false), 100);
      })
      .catch((err) => {
        setError(err.message || 'Failed to remove destinations');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Cache the avatar URL to prevent rate limiting
  const avatarUrl = useMemo(() => {
    if (!user?.photoURL) return null;
    try {
      const url = new URL(user.photoURL);
      // Add a cache buster that changes daily to prevent over-caching
      const date = new Date().toISOString().split('T')[0];
      url.searchParams.set('cb', date);
      return url.toString();
    } catch {
      return user.photoURL;
    }
  }, [user?.photoURL]);

  if (!isSideMenuOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${!isSideMenuOpen && 'pointer-events-none'}`}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
          isSideMenuOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsSideMenuOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setIsSideMenuOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="Close menu"
      />
      <nav
        ref={menuRef}
        style={{ transform: `translateX(${isSideMenuOpen ? '0' : '-100%'})` }}
        className="fixed left-0 top-0 bottom-0 w-[280px] bg-white shadow-lg transition-transform duration-300 ease-out"
        aria-label="Side menu"
        role="navigation"
      >
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button
              onClick={() => setIsSideMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.displayName || 'User avatar'}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    // On error, replace with default avatar and prevent further attempts
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
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

          <div className="py-2 bg-white">
            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={() => setIsSideMenuOpen(false)}
              role="button"
              tabIndex={0}
              aria-label="Go to wishlist"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              My Wishlist
            </Link>

            <button
              type="button"
              onClick={handleCreateBackup}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              disabled={isLoading}
              aria-label="Create backup"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Create Backup
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              disabled={isLoading}
              aria-label="Restore backup"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Restore Backup
            </button>

            <button
              type="button"
              onClick={() => {
                if (isLoading) return;
                setShowConfirmModal(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-red-600"
              disabled={isLoading}
              aria-label="Remove all destinations"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
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
              aria-label="Sign out"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
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
      </nav>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4" role="document">
            <h2 id="modal-title" className="text-xl font-semibold mb-4">
              Remove All Destinations
            </h2>
            <p className="mb-6">
              Are you sure you want to remove all destinations? This action cannot be undone.
            </p>
            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (!isLoading) setShowConfirmModal(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                disabled={isLoading}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleRemoveAllDestinations(e);
                }}
                disabled={isLoading}
                className="relative px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                aria-label="Remove all destinations"
              >
                <span
                  className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                >
                  Remove All
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
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
    </div>
  );
};

export default SideMenu;
