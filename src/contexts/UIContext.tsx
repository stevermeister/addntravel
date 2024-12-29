import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (open: boolean) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: (show: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <UIContext.Provider
      value={{
        showAddForm,
        setShowAddForm,
        isCalendarOpen,
        setIsCalendarOpen,
        showSearch,
        setShowSearch,
        isSideMenuOpen,
        setIsSideMenuOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
