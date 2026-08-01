// T048: Create auth types
export enum UserRole {
  WORKER = 'WORKER',
  SUPERVISOR = 'SUPERVISOR',
  MANAGER = 'MANAGER',
  QUALITY_CONTROLLER = 'QUALITY_CONTROLLER',
  ADMIN = 'ADMIN',
}

export interface User {
  user_id: string;
  google_email: string;
  full_name: string;
  role: UserRole;
  assigned_stage: string;
  last_login_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  session_expires_in?: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface GoogleCredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}
