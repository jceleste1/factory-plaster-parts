import React from 'react';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

/**
 * Header component with user info and logout
 */
export const Header: React.FC<HeaderProps> = ({ userName, userRole, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">MFG</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
            Manufacturing Tracking
          </h1>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          {userName && userRole && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          )}

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
            >
              <span className="text-sm font-medium text-gray-700">
                {userName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
