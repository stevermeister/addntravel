import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { user, login, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <img 
            src="/logo-for-website-addntravel-com.png" 
            alt="Add n Travel" 
            className="w-64 mx-auto mb-4"
          />
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <p className="text-gray-600 text-center text-sm">
              Keep track of your dream destinations
            </p>
          </div>

          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c2.118,0,3.536-1.418,3.536-3.536v-0.318c0-2.118-1.418-3.536-3.536-3.536h-3.536c-1.054,0-1.909,0.855-1.909,1.909v0.318c0,1.054,0.855,1.909,1.909,1.909h3.536" />
              <path d="M8.364,12.151L8.364,12.151c0-1.054-0.855-1.909-1.909-1.909H2.918c-2.118,0-3.536,1.418-3.536,3.536v0.318c0,2.118,1.418,3.536,3.536,3.536h3.536c1.054,0,1.909-0.855,1.909-1.909v-0.318c0-1.054-0.855-1.909-1.909-1.909H2.918" />
            </svg>
            Sign in with Google
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        {new Date().getFullYear()} AddnTravel. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
