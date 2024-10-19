// app/(site)/logout/route.jsx

import { getServerSession } from 'next-auth/next'
import { signOut } from 'next-auth/react'
import { authOptions } from '../../api/auth/[...nextauth]/route'

export async function GET(req) {
  const session = await getServerSession(authOptions)

  if (session) {
    // Log the user out
    await signOut({ redirect: false, callbackUrl: '/' })
    return new Response('Logged out', { status: 200 })
  } else {
    return new Response('Not logged in', { status: 401 })
  }
}
