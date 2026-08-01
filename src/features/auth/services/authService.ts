// T047: Create auth service
import apiClient from '../../shared/services/apiClient';
import { User, AuthResponse } from './auth.types';
import { authResponseSchema, userSchema } from './auth.schema';

class AuthService {
  async loginWithGoogle(token: string): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        token,
      });

      // Validate response with Zod schema
      const validatedResponse = authResponseSchema.parse(response.data);

      if (!validatedResponse.success || !validatedResponse.user) {
        throw new Error(validatedResponse.message || 'Login failed');
      }

      // Validate user object
      const user = userSchema.parse(validatedResponse.user);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Authentication failed: ${error.message}`);
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<AuthResponse>('/auth/session');
      const validatedResponse = authResponseSchema.parse(response.data);

      if (!validatedResponse.success || !validatedResponse.user) {
        return null;
      }

      return userSchema.parse(validatedResponse.user);
    } catch (error) {
      // 401 means not authenticated
      if (error instanceof Error && error.message.includes('401')) {
        return null;
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      // Even if logout endpoint fails, clear local session
      console.error('Logout error:', error);
    }
  }
}

export default new AuthService();
