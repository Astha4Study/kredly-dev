import { createAuthClient } from 'better-auth/react';

// Client-side auth configuration
export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_AUTH_SERVER_URL || '/',
});

export const { signIn, signOut, signUp, useSession } = authClient;
