import { z } from 'zod';

export const loginSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
});

export const userSchema = z.object({
  user_id: z.string(),
  google_email: z.string().email(),
  full_name: z.string(),
  role: z.enum(['WORKER', 'SUPERVISOR', 'MANAGER', 'QUALITY_CONTROLLER', 'ADMIN']),
  assigned_stage: z.string(),
  last_login_at: z.string().datetime().optional(),
});

export const authResponseSchema = z.object({
  success: z.boolean(),
  user: userSchema.optional(),
  message: z.string().optional(),
  session_expires_in: z.number().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
