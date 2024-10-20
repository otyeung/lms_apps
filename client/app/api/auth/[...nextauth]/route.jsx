// file: app/api/auth/[...nextauth]/route.jsx

import NextAuth from 'next-auth/next'
import prisma from '../../../libs/prismadb'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import LinkedInProvider from 'next-auth/providers/linkedin'

// Define the authOptions for NextAuth
export const authOptions = {
  // Set the adapter to the PrismaAdapter
  adapter: PrismaAdapter(prisma),
  // Set the providers, including LinkedIn
  providers: [
    LinkedInProvider({
      // Use environment variables for client ID and secret
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      // Define required application scopes for LinkedIn
      authorization: {
        params: {
          scope:
            'r_marketing_leadgen_automation,rw_organization_admin,r_organization_social_feed,w_member_social,r_ads,r_emailaddress,rw_conversions,r_basicprofile,r_organization_admin,w_member_social_feed,email,r_1st_connections_size,rw_offlineConversions,r_events_leadgen_automation,profile,r_organization_followers,r_ads_reporting,r_liteprofile,r_organization_social,w_organization_social,rw_ads,w_organization_social_feed,rw_dmp_segments,r_events,r_ads_leadgen_automation',
        },
      },
    }),
  ],
  // Use a secret for signing the session
  secret: process.env.NEXTAUTH_SECRET, // Updated to use NEXTAUTH_SECRET
  // Use JWT strategy for sessions
  session: {
    strategy: 'jwt',
  },
  // Callbacks for handling session
  callbacks: {
    async session({ session, token }) {
      // Include user ID and access token in the session from the token
      if (token?.sub) {
        session.user.id = token.sub // Assuming token.sub holds the user ID
      }
      session.user.accessToken = token.accessToken // Include access token in session

      // Log the session object
      console.log('Current session object:', session)

      return session
    },
    async jwt({ token, user, account }) {
      // If a user is present, add their ID to the token
      if (user) {
        token.sub = user.id // Store user ID in the token
      }
      if (account) {
        token.accessToken = account.access_token // Store access token in the token
      }
      return token
    },
  },
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
}

// Create the NextAuth handler
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
