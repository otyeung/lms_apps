// filename : app/(site)/delete/route.jsx

import prisma from '../../libs/prismadb' // Adjust the import based on your structure

export async function DELETE(req) {
  try {
    const { userId } = await req.json() // Assume the user ID is sent in the request body

    // Check if userId is provided
    if (!userId) {
      return new Response('User ID is required', { status: 400 })
    }

    // Delete the user and cascade delete related accounts and adAccounts
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      include: {
        accounts: true, // Include related accounts
        adAccounts: true, // Include related ad accounts
      },
    })

    // Optionally, handle what to do with deleted accounts and ad accounts
    // For example, logging or other operations
    console.log('Deleted user:', deletedUser)

    return new Response(`User with ID ${deletedUser.id} deleted successfully`, {
      status: 200,
    })
  } catch (error) {
    // Enhanced error handling
    if (error.code === 'P2025') {
      return new Response('User not found', { status: 404 }) // User not found
    } else {
      console.error('Error deleting user:', error)
      return new Response('Error deleting user', { status: 500 }) // General server error
    }
  }
}
