// filename : app/api/checkUser/route.jsx

import prisma from '../../libs/prismadb'

export async function GET(req) {
  // Get user ID from query parameters
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('id') // Get the ID from the query string

  if (!userId) {
    return new Response('User ID is required', { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return new Response('Error fetching user', { status: 500 })
  }
}
