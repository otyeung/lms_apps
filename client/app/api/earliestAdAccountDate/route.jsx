// app/api/earliestAdAccountDate/route.jsx

import prisma from '../../libs/prismadb' // Adjust the path as necessary
import { ObjectId } from 'mongodb'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') // Extract userId from query parameters

  try {
    const earliestAccount = await prisma.adAccount.findFirst({
      where: { userId: new ObjectId(userId) }, // Use ObjectId to match the userId type
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    })

    // Return the createdAt date or null if no account was found
    return new Response(JSON.stringify(earliestAccount?.createdAt), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching earliest AdAccount date:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
