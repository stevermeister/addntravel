import React from 'react';
import { versionInfo } from '../utils/version.js';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">AddnTravel</h1>
          <span className="ml-4 text-sm opacity-75">{versionInfo.formatted}</span>
        </div>
        <nav>
          {/* Add navigation items here if needed */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
