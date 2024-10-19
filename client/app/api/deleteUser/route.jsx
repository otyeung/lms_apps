// app/api/deleteUser/route.jsx

import { NextResponse } from 'next/server'
import prisma from '../../libs/prismadb'

export async function DELETE(request) {
  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 })
  }

  try {
    // Assuming you have a User model set up in Prisma
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: 'User deleted successfully.' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user.' },
      { status: 500 }
    )
  }
}
