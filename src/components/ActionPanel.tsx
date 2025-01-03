import React, { useState, useEffect } from 'react';

interface ActionPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  destinationName: string;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  isVisible,
  onClose,
  onEdit,
  onDelete,
  destinationName,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);
    }
  }, [isVisible]);

  if (!isVisible && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <button
        onClick={handleClose}
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        aria-label="Close action panel"
      />

      {/* Action Panel */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 transform ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Handle */}
        <button
          onClick={handleClose}
          className="w-full flex justify-center pt-4 pb-2"
          aria-label="Close action panel"
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full hover:bg-gray-300" />
        </button>

        {/* Title */}
        <div className="px-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 truncate">{destinationName}</h2>
        </div>

        {/* Actions */}
        <div className="px-4 pb-8 space-y-3">
          <button
            onClick={() => {
              handleClose();
              onEdit();
            }}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Destination
          </button>
          <button
            onClick={() => {
              handleClose();
              onDelete();
            }}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-white border border-red-200 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Destination
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;
