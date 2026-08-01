// T057: Update Header component to display authenticated user
import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LogoutButton } from '../../features/auth/components/LogoutButton';
import { ChevronDown } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

/**
 * Header component with user info and logout
 * Updated to use AuthContext for dynamic user display
 */
export const Header: React.FC<HeaderProps> = ({ userName: propUserName, userRole: propUserRole, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Try to get user from auth context, fallback to props
  let displayUserName = propUserName;
  let displayUserRole = propUserRole;
  
  try {
    const { user } = useAuth();
    if (user) {
      displayUserName = user.full_name;
      displayUserRole = user.role;
    }
  } catch {
    // useAuth not available (outside AuthProvider), use props
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Get role badge color
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'SUPERVISOR':
        return 'bg-purple-100 text-purple-800';
      case 'QUALITY_CONTROLLER':
        return 'bg-yellow-100 text-yellow-800';
      case 'WORKER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format role display
  const formatRole = (role?: string) => {
    if (!role) return '';
    return role.replace(/_/g, ' ');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">MFG</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
            Manufacturing Tracking
          </h1>
        </div>

        {/* User Info & Dropdown */}
        <div className="flex items-center gap-4">
          {displayUserName && displayUserRole && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{displayUserName}</p>
              <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${getRoleBadgeColor(displayUserRole)}`}>
                {formatRole(displayUserRole)}
              </span>
            </div>
          )}

          {/* Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
            >
              <span className="text-sm font-medium text-gray-700">
                {displayUserName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-100"
                role="menu"
                aria-orientation="vertical"
              >
                {/* User Info in Dropdown */}
                {displayUserName && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Authenticated as</p>
                    <p className="text-sm font-medium text-gray-900">{displayUserName}</p>
                  </div>
                )}

                {/* Logout Button */}
                <LogoutButton
                  onLogoutComplete={() => {
                    setIsDropdownOpen(false);
                    onLogout?.();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
