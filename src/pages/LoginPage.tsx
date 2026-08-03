// T052: Create LoginPage
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthButton } from '../features/auth/components/GoogleOAuthButton';
import { useAuth } from '../features/auth/hooks/useAuth';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { AuthLayout } from '@/layouts/AuthLayout';
import authService from '@/features/auth/services/authService';
import { UserRole } from '@/shared/types/domain.types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoRole, setDemoRole] = useState<UserRole>(UserRole.QUALITY_CONTROLLER);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Redirect if already authenticated
  useEffect(() => {

    console.log( 'LoginPage: isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setIsSubmitting(true);
      setLocalError(null);
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      await login(credentialResponse.credential);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setLocalError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setLocalError('Google login failed. Please try again.');
  };

  const handleDemoLogin = async () => {
    try {
      setIsSubmitting(true);
      setLocalError(null);

      // Create demo user and store in localStorage
      authService.createDemoLogin(demoRole);
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Demo login failed. Please try again.';
      setLocalError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manufacturing Tracking</h1>
          <p className="text-gray-600">Gypsum Tile Production Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600 text-sm">Sign in with your Google account to continue</p>
          </div>

          {/* Error Messages */}
          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">
                <span className="font-bold">⚠️ </span>
                {error || localError}
              </p>
              <p className="text-red-700 text-xs mt-2">
                If you believe you should have access, please contact your administrator.
              </p>
            </div>
          )}

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
              logo_alignment="left"
            />
          </div>

          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border border-gray-300 border-t-gray-900"></div>
              <span>Signing in...</span>
            </div>
          )}

          {/* Demo Login Section - Development Only */}
          {!import.meta.env.PROD && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-white text-gray-500">Development Only</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Demo Login - Test Different Roles</label>
                <select
                  value={demoRole}
                  onChange={(e) => setDemoRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value={UserRole.QUALITY_CONTROLLER}>🔍 QC Inspector (QUALITY_CONTROLLER)</option>
                  <option value={UserRole.MANAGER}>📊 Manager (MANAGER)</option>
                  <option value={UserRole.WORKER}>👷 Worker (WORKER)</option>
                  <option value={UserRole.ADMIN}>⚙️ Admin (ADMIN)</option>
                </select>

                <button
                  onClick={handleDemoLogin}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Signing in...' : '🚀 Demo Login'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Demo login is only available in development mode and stores mock user data locally.
                </p>
              </div>
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border border-gray-300 border-t-gray-900"></div>
              <span>Loading...</span>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 Manufacturing Management System</p>
          <p>Protected by Google Sign-In Security</p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
