import NextAuth from 'next-auth/next'
import prisma from '../../../libs/prismadb'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import LinkedInProvider from 'next-auth/providers/linkedin'
import bcrypt from 'bcrypt'

export const authOptions = {
  // set the adapter to the PrismaAdapter
  adapter: PrismaAdapter(prisma),
  // set the providers to the GitHub, Google, and LinkedIn providers
  providers: [
    LinkedInProvider({
      // set the clientId to the LINKEDIN_ID environment variable
      clientId: process.env.LINKEDIN_CLIENT_ID,
      // set the clientSecret to the LINKEDIN_SECRET environment variable
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      //  Put all required application scope from LinkedIn
      // set the authorization parameters to the required application scope from LinkedIn
      authorization: {
        params: {
          scope:
            'r_marketing_leadgen_automation,rw_organization_admin,r_organization_social_feed,w_member_social,r_ads,r_emailaddress,rw_conversions,r_basicprofile,r_organization_admin,w_member_social_feed,email,r_1st_connections_size,rw_offlineConversions,r_events_leadgen_automation,profile,r_organization_followers,r_ads_reporting,r_liteprofile,r_organization_social,w_organization_social,rw_ads,w_organization_social_feed,rw_dmp_segments,r_events,r_ads_leadgen_automation',
        },
      },
    }),
  ],
  // set the secret to the SECRET environment variable
  secret: process.env.SECRET,
  // set the session to use JWT
  session: {
    strategy: 'jwt',
  },
  // set the debug to the NODE_ENV environment variable
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
