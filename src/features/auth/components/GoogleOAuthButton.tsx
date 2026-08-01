// T050: Create GoogleOAuthButton component
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';

interface GoogleOAuthButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: () => void;
  isLoading?: boolean;
}

export const GoogleOAuthButtonContent: React.FC<GoogleOAuthButtonProps> = ({
  onSuccess,
  onError,
  isLoading,
}) => {
  return (
    <div className="w-full flex justify-center">
      {isLoading ? (
        <button
          disabled
          className="h-11 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium cursor-not-allowed flex items-center gap-2 transition-colors"
          aria-label="Signing in with Google..."
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Signing in...</span>
        </button>
      ) : (
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="outline"
          size="large"
          text="signin_with"
          logo_alignment="left"
        />
      )}
    </div>
  );
};

// Export a standalone version that wraps with GoogleOAuthProvider
interface GoogleOAuthButtonStandaloneProps extends GoogleOAuthButtonProps {
  googleClientId: string;
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonStandaloneProps> = ({
  googleClientId,
  onSuccess,
  onError,
  isLoading,
}) => {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleOAuthButtonContent onSuccess={onSuccess} onError={onError} isLoading={isLoading} />
    </GoogleOAuthProvider>
  );
};
