// Shared types for API communication
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  status: number;
  message: string;
  code: string;
}
