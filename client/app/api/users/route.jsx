// app/api/users/[id]/route.jsx

import prisma from '../../libs/prismadb'

export async function GET(req, { params }) {
  const { id } = params

  if (!id) {
    return new Response('User ID is required', { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
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
