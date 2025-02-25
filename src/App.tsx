import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import SideMenu from './components/SideMenu';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';

const App: React.FC = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  return (
    <AuthProvider>
      <UIProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-grow pb-14 md:pb-0">
                        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
                          <Routes>
                            <Route
                              path="/"
                              element={
                                <Wishlist
                                  isSearchVisible={isSearchVisible}
                                  onSearchClose={() => setIsSearchVisible(false)}
                                />
                              }
                            />
                            <Route
                              path="/wishlist"
                              element={
                                <Wishlist
                                  isSearchVisible={isSearchVisible}
                                  onSearchClose={() => setIsSearchVisible(false)}
                                />
                              }
                            />
                            <Route
                              path="/search"
                              element={
                                <Wishlist
                                  isSearchVisible={isSearchVisible}
                                  onSearchClose={() => setIsSearchVisible(false)}
                                />
                              }
                            />
                            <Route
                              path="/add"
                              element={
                                <Wishlist
                                  isSearchVisible={isSearchVisible}
                                  onSearchClose={() => setIsSearchVisible(false)}
                                />
                              }
                            />
                            <Route
                              path="/calendar"
                              element={
                                <Wishlist
                                  isSearchVisible={isSearchVisible}
                                  onSearchClose={() => setIsSearchVisible(false)}
                                />
                              }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </div>
                      </main>
                      <Footer className="hidden md:block" />
                      <BottomNav onSearchClick={() => setIsSearchVisible(true)} />
                      <SideMenu />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
