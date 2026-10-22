import React from 'react';
import { useSession } from '@renderer/hooks/useSession';
import { LoginPage } from './LoginPage';

// Wrap any protected part of the app. Shows the login page when there is no session.
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const { session, loading } = useSession();

   if (loading) return null; // or a spinner
   if (!session) return <LoginPage />;

   return <>{children}</>;
};
