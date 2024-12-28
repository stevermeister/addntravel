import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SettingsMenu from './SettingsMenu';

const Header: React.FC = () => {
  const { user, login, logout } = useAuth();

  const renderAvatar = () => {
    if (user?.photoURL) {
      return (
        <img
          src={user.photoURL}
          alt={user.displayName || 'User avatar'}
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            e.currentTarget.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
          }}
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
        {(user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-1">
            <Link to="/" className="text-xl font-medium tracking-wide hover:opacity-80 transition-opacity flex items-center group" title="add and travel">
              <span>add</span>
              <span className="mx-1.5 text-blue-500 font-light text-sm align-top">
                {'(n)'}
              </span>
              <span>travel</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <SettingsMenu onDataChange={() => {}} />
                <div className="flex items-center gap-2">
                  {renderAvatar()}
                  <span className="text-sm text-gray-700">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="ml-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
      </div>
    </header>
  );
};

export default Header;
