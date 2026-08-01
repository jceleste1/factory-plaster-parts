// T054: Create useAuth hook
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthContextType, UserRole } from '../types/auth.types';

export const useAuth = (): AuthContextType & {
  hasRole: (role: UserRole | UserRole[]) => boolean;
} => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!context.user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(context.user.role);
    }
    return context.user.role === roles;
  };

  return {
    ...context,
    hasRole,
  };
};
