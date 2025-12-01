'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-provider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // The AuthProvider now provides the user object directly from onAuthStateChanged
  return context.user;
};
