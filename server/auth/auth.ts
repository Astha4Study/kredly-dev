import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),

  // Base URL for better-auth API endpoints
  baseURL: `${process.env.AUTH_SERVER_URL || 'http://localhost:3001'}/api/auth`,

  // Allowed origins for CORS
  trustedOrigins: [process.env.PUBLIC_CLIENT_URL || 'http://localhost:3000'],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // OAuth callback endpoint on auth server
      redirectURI: `${process.env.AUTH_SERVER_URL || 'http://localhost:3001'}/api/auth/callback/google`,
    },
  },
});
