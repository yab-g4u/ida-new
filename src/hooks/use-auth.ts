'use client';

import { useAuth as useAuthFromContext } from '@/contexts/auth-provider';

/**
 * @deprecated Use `useAuth` from `@/contexts/auth-provider` instead.
 */
export const useAuth = () => {
  return useAuthFromContext();
};
