import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (show: boolean) => void;
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: (show: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <UIContext.Provider value={{
      showAddForm,
      setShowAddForm,
      showSearch,
      setShowSearch,
      isCalendarOpen,
      setIsCalendarOpen,
      isSideMenuOpen,
      setIsSideMenuOpen,
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
