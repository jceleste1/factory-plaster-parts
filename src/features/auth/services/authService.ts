// T047: Create auth service - Simplified: No backend calls, JWT decoding only
import { User, UserRole } from '@/shared/types/domain.types';

// Decode JWT payload without verification (Google token is already signed by Google)
function decodeJWT(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    throw new Error('Invalid token format');
  }
}

class AuthService {
  async loginWithGoogle(token: string): Promise<User> {
    try {
      // Decode Google JWT token to extract user information
      const payload = decodeJWT(token) as {
        email?: string;
        name?: string;
        picture?: string;
        sub?: string;
        given_name?: string;
        family_name?: string;
      };

      if (!payload.email || !payload.sub) {
        throw new Error('Invalid Google token: missing required fields');
      }

      // Create user object from Google token payload
      const userObj = {
        user_id: payload.sub as string,
        google_email: payload.email as string,
        full_name: payload.given_name && payload.family_name 
          ? `${payload.given_name} ${payload.family_name}` 
          : (payload.name as string) || (payload.email as string),
        role: 'WORKER' as const,
        last_login_at: new Date(),
      };
      const user: User = userObj as unknown as User;

      // Store token and user in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

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
      const userJson = localStorage.getItem('user');
      if (!userJson) {
        return null;
      }

      const user = JSON.parse(userJson) as User;
      return user;
    } catch (error) {
      console.error('Failed to get current user from localStorage:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    // Clear local storage only (no backend call needed)
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}

export default new AuthService();
