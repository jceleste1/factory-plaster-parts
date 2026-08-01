import React from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '../types/domain.types';
import { getNavItemsForRole } from '../../app/routes';

interface NavigationProps {
  userRole?: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Navigation component with role-based menu items
 */
export const Navigation: React.FC<NavigationProps> = ({ userRole, isOpen = true }) => {
  const navItems = userRole ? getNavItemsForRole(userRole) : [];

  return (
    <nav
      className={`${isOpen ? 'block' : 'hidden'} md:block bg-white border-b border-gray-200 md:border-b-0`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-0 md:gap-8 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="px-4 md:px-0 py-2 md:py-4 text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-b-2 hover:border-primary-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
