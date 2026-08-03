import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../shared/types/domain.types';

export interface RouteDefinition {
  path: string;
  label: string;
  isPublic: boolean;
  requiredRoles?: UserRole[];
}

export const ROUTE_PATHS = {
  // Public routes
  LOGIN: '/auth/login',
  OAUTH_CALLBACK: '/auth/callback',
  NOT_FOUND: '/404',

  // Protected routes
  DASHBOARD: '/dashboard',
  BATCH_DETAIL: '/batches/:batch_id',
  MY_WORK: '/my-work',
  QUALITY_INSPECTION: '/quality',
  REPORTS: '/reports',
  ADMIN: '/admin',
} as const;

export const PUBLIC_ROUTES: RouteDefinition[] = [
  {
    path: ROUTE_PATHS.LOGIN,
    label: 'Login',
    isPublic: true,
  },
  {
    path: ROUTE_PATHS.OAUTH_CALLBACK,
    label: 'OAuth Callback',
    isPublic: true,
  },
];

export const PROTECTED_ROUTES: RouteDefinition[] = [
  {
    path: ROUTE_PATHS.DASHBOARD,
    label: 'Production Dashboard',
    isPublic: false,
    requiredRoles: [
      UserRole.WORKER,
      UserRole.SUPERVISOR,
      UserRole.MANAGER,
      UserRole.ADMIN,
    ],
  },
  {
    path: ROUTE_PATHS.BATCH_DETAIL,
    label: 'Batch Details',
    isPublic: false,
    requiredRoles: [
      UserRole.WORKER,
      UserRole.SUPERVISOR,
      UserRole.MANAGER,
      UserRole.ADMIN,
    ],
  },
  {
    path: ROUTE_PATHS.MY_WORK,
    label: 'My Work',
    isPublic: false,
    requiredRoles: [
      UserRole.WORKER,
      UserRole.SUPERVISOR,
      UserRole.MANAGER,
      UserRole.ADMIN,
    ],
  },
  {
    path: ROUTE_PATHS.QUALITY_INSPECTION,
    label: 'Quality Inspection',
    isPublic: false,
    requiredRoles: [
      UserRole.QUALITY_CONTROLLER,
      UserRole.MANAGER,
      UserRole.ADMIN,
    ],
  },
  {
    path: ROUTE_PATHS.REPORTS,
    label: 'Reports',
    isPublic: false,
    requiredRoles: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    path: ROUTE_PATHS.ADMIN,
    label: 'Administration',
    isPublic: false,
    requiredRoles: [UserRole.ADMIN],
  },
];

export const ALL_ROUTES = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES];

/**
 * Check if user has required role for a route
 */
export function hasRequiredRole(userRole: UserRole, requiredRoles?: UserRole[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  return requiredRoles.includes(userRole);
}

/**
 * Get navigation items for a specific user role
 */
export function getNavItemsForRole(userRole: UserRole): RouteDefinition[] {
  return PROTECTED_ROUTES.filter((route) =>
    hasRequiredRole(userRole, route.requiredRoles),
  );
}
