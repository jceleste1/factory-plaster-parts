// T055: Create useSession hook
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import authService from '../services/authService';
import { useAuth } from './useAuth';

export const useSession = () => {
  const { login, user } = useAuth();

  const { data: sessionUser, isLoading, error } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      return await authService.getCurrentUser();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Update user in context if session user differs
  useEffect(() => {
    if (sessionUser && !user) {
      // Session exists but context user is null, sync it
      // Note: This is a fallback, ideally the context would have been restored already
    }
  }, [sessionUser, user]);

  return {
    isValidating: isLoading,
    error,
    isSessionValid: !!sessionUser,
  };
};
