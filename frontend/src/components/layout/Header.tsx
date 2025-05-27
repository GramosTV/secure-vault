import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">SecureVault</h1>
            </div>{' '}
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {isAuthenticated && (
                <>
                  <Link
                    to="/"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/encryption"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Encrypt
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Profile
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 text-sm">Welcome, {user?.username}</span>{' '}
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>{' '}
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>{' '}
      {/* Mobile menu */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link
              to="/encryption"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Encrypt
            </Link>
            <Link
              to="/profile"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
