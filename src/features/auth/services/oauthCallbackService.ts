// T059: Create OAuth callback handling utility
import { User } from '../types/auth.types';

export interface CallbackParams {
  token?: string;
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export const extractCallbackParams = (): CallbackParams => {
  const params = new URLSearchParams(window.location.search);
  return {
    token: params.get('token') || undefined,
    code: params.get('code') || undefined,
    state: params.get('state') || undefined,
    error: params.get('error') || undefined,
    error_description: params.get('error_description') || undefined,
  };
};

export const extractHashParams = (): CallbackParams => {
  const params = new URLSearchParams(window.location.hash.substring(1));
  return {
    token: params.get('token') || undefined,
    code: params.get('code') || undefined,
    state: params.get('state') || undefined,
    error: params.get('error') || undefined,
    error_description: params.get('error_description') || undefined,
  };
};

export const getCallbackToken = (): string | null => {
  // Check URL search params first
  const searchParams = extractCallbackParams();
  if (searchParams.token) {
    return searchParams.token;
  }

  // Check URL hash params (Google OAuth redirect fragment)
  const hashParams = extractHashParams();
  if (hashParams.token) {
    return hashParams.token;
  }

  // Check sessionStorage (might be set by OAuth middleware)
  const sessionToken = sessionStorage.getItem('oauth_token');
  if (sessionToken) {
    sessionStorage.removeItem('oauth_token');
    return sessionToken;
  }

  return null;
};

export const hasCallbackError = (): { error: true; message: string } | { error: false } => {
  const searchParams = extractCallbackParams();
  if (searchParams.error) {
    return {
      error: true,
      message: searchParams.error_description || searchParams.error,
    };
  }

  const hashParams = extractHashParams();
  if (hashParams.error) {
    return {
      error: true,
      message: hashParams.error_description || hashParams.error,
    };
  }

  return { error: false };
};

export const cleanupCallbackUrl = () => {
  // Clean up URL after processing callback
  window.history.replaceState({}, '', '/auth/callback');
};
