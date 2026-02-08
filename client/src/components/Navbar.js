import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600">
              JobPortal
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            
            <Link
              to="/jobs"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/jobs') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Jobs
            </Link>

            {user?.role === 'recruiter' && (
              <Link
                to="/post-job"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/post-job') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Post Job
              </Link>
            )}

            {user?.role === 'candidate' && (
              <Link
                to="/applications"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/applications') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Applications
              </Link>
            )}

            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/profile') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Profile
            </Link>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
