import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { versionInfo } from '../utils/version';

const Header = () => {
  const { user, login, logout } = useAuth();

  const UserAvatar = () => {
    if (user?.photoURL) {
      return (
        <img
          src={user.photoURL}
          alt={user.displayName || 'User avatar'}
          className="w-8 h-8 rounded-full mr-2"
          onError={(e) => {
            e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
          }}
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full mr-2 bg-blue-700 flex items-center justify-center text-white">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <UserAvatar />
                <span className="text-sm font-medium">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                Sign Out
              </button>
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
    </header>
  );
};

export default Header;
