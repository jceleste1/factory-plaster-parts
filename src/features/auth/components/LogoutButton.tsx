// T051: Create LogoutButton component
import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LogoutButtonProps {
  onLogoutComplete?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogoutComplete }) => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      await logout();
      // Redirect is handled in logout function, but call callback if provided
      onLogoutComplete?.();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Confirm Logout</h2>
          <p className="text-gray-700 mb-6">Are you sure you want to log out?</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Cancel logout"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutClick}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              aria-label={isLoading ? 'Logging out...' : 'Confirm logout'}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogoutClick}
      disabled={isLoading}
      className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
      aria-label="Logout from application"
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
};
