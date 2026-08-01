// API endpoint constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SESSION: '/auth/session',
    LOGOUT: '/auth/logout',
  },
  BATCHES: {
    DASHBOARD: '/batches/dashboard',
    LIST: '/batches',
    DETAIL: '/batches/:id',
    TRANSITIONS: '/batches/:id/transitions',
  },
  QUALITY: {
    INSPECTIONS: '/quality/inspections',
    DEFECTS: '/quality/defects',
    APPROVE: '/quality/approve',
  },
  REPORTS: {
    EFFICIENCY: '/reports/efficiency',
    BOTTLENECK: '/reports/bottleneck',
    AUDIT: '/reports/audit',
  },
  HEALTH: '/health',
};

// Manufacturing stage configuration
export const MANUFACTURING_STAGES = [
  'PLANNING',
  'MIXING',
  'MOLDING',
  'CURING',
  'FINISHING',
  'QUALITY',
  'PACKAGING',
  'SHIPPING',
] as const;

// User roles
export const USER_ROLES = {
  WORKER: 'WORKER',
  SUPERVISOR: 'SUPERVISOR',
  MANAGER: 'MANAGER',
  QUALITY_CONTROLLER: 'QUALITY_CONTROLLER',
  ADMIN: 'ADMIN',
} as const;

// Status indicators
export const STATUS_COLORS = {
  GREEN: '#4CAF50',
  YELLOW: '#FFA726',
  RED: '#EF5350',
} as const;

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  HEALTH_CHECK: 10000, // 10 seconds
  SESSION_VALIDATION: 300000, // 5 minutes
} as const;

// Timeout durations (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  SYNC_OPERATION: 60000, // 1 minute
} as const;
