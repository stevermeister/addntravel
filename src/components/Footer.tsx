import React from 'react';
import { versionInfo } from '../utils/version';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`mt-auto py-4 px-4 border-t border-gray-100 ${className}`}>
      <div className="container mx-auto flex justify-center">
        <span className="text-sm text-gray-500">{versionInfo.formatted}</span>
      </div>
    </footer>
  );
};

export default Footer;
