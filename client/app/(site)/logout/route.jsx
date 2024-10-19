import { getServerSession } from 'next-auth/next'
import { signOut } from 'next-auth/react'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import prisma from '../../libs/prismadb' // Adjust the import based on your structure

export async function GET(req) {
  const session = await getServerSession(authOptions)

  if (session) {
    const userId = session.user.id

    // Log the session to check if userId is correct
    console.log('Session:', session)

    try {
      // Check if the user exists before attempting to delete
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        // If user is not found, return an appropriate response with redirect
        return new Response('User not found. Redirecting to login...', {
          status: 404,
          headers: { Refresh: '5; url=/login' },
        })
      }

      // Proceed to delete the user and cascade delete related accounts and adAccounts
      const deletedUser = await prisma.user.delete({
        where: { id: userId },
        include: {
          accounts: true, // Include related accounts
          adAccounts: true, // Include related ad accounts
        },
      })

      console.log('Deleted user:', deletedUser)

      // Log the user out and delete the session
      await signOut({ redirect: false })

      // Provide a success message with 5-second redirection to the login page
      return new Response(
        'User deleted successfully. Redirecting to login...',
        {
          status: 200,
          headers: { Refresh: '5; url=/login' },
        }
      )
    } catch (error) {
      console.error('Error deleting user:', error) // Log the actual error
      return new Response(`Error deleting user: ${error.message}`, {
        status: 500,
      })
    }
  } else {
    return new Response('Not logged in. Redirecting to login...', {
      status: 401,
      headers: { Refresh: '5; url=/login' },
    })
  }
}
