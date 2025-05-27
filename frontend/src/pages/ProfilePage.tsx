import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';

interface UserStats {
  totalMessages: number;
  user: {
    id: number;
    username: string;
    email: string;
    createdAt: string;
  };
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<UserStats>('/user/stats');
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load user statistics. Please try again.');
      console.error('Error fetching user stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading user data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <button onClick={fetchUserStats} className="mt-2 text-red-600 hover:text-red-800 underline">
                Try again
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User Profile</h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">{user?.username}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">{user?.email}</div>
              </div>{' '}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                  {stats?.user?.createdAt
                    ? new Date(stats.user.createdAt).toLocaleDateString()
                    : user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
              {stats && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Messages</label>
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">{stats.totalMessages}</div>
                </div>
              )}
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
                <div className="space-y-4">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-green-900">Two-Factor Authentication</h3>
                  <p className="text-green-700">Add an extra layer of security to your account</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Change Password</h3>
                  <p className="text-blue-700">Update your account password</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-yellow-900">Download Data</h3>
                  <p className="text-yellow-700">Export your encrypted messages</p>
                </div>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
