// Core domain models used across the application
export enum UserRole {
  WORKER = 'WORKER',
  SUPERVISOR = 'SUPERVISOR',
  MANAGER = 'MANAGER',
  QUALITY_CONTROLLER = 'QUALITY_CONTROLLER',
  ADMIN = 'ADMIN',
}

export enum ManufacturingStage {
  PLANNING = 'PLANNING',
  MIXING = 'MIXING',
  MOLDING = 'MOLDING',
  CURING = 'CURING',
  FINISHING = 'FINISHING',
  QUALITY = 'QUALITY',
  PACKAGING = 'PACKAGING',
  SHIPPING = 'SHIPPING',
}

export enum StatusIndicator {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export interface User {
  user_id: string;
  google_email: string;
  full_name: string;
  role: UserRole;
  assigned_stage?: ManufacturingStage;
  last_login_at: Date;
}
