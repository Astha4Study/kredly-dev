import { createAuthClient } from 'better-auth/react';

// Client-side auth configuration
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:3001',
});

export const { signIn, signOut, signUp, useSession } = authClient;
