import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`mt-auto py-4 px-4 border-t border-gray-100 ${className}`}>
      <div className="container mx-auto flex justify-center">
        <span className="text-sm text-gray-500">v0.1.3 (27/12/2024)</span>
      </div>
    </footer>
  );
};

export default Footer;
