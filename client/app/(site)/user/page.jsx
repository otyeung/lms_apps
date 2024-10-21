// filename: app/(site)/user/page.jsx

import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import prisma from '../../libs/prismadb'
import { redirect } from 'next/navigation'
import DeleteUser from '../../component/DeleteUser' // Client-side component
import AccountDetailsClient from './AccountDetailsClient' // Client-side component

export default async function User() {
  const session = await getServerSession(authOptions)

  if (!session) {
    // Redirect to the login page if there's no session
    return redirect('/login')
  }

  // Fetch the user data directly from the database
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true, // Include accounts in the fetched user
    },
  })

  if (!user) {
    return <p>User not found.</p>
  }

  const account = user.accounts[0] // Assuming the user has only one account linked

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome! {user.name}</p>
          {user.image ? (
            <img
              src={user.image}
              alt='User profile'
              className='profile-image'
            />
          ) : (
            <p>No profile image available</p>
          )}

          {/* Display account information */}
          {account ? (
            <AccountDetailsClient account={account} /> // Use Client Component
          ) : (
            <p>No account information available.</p>
          )}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <DeleteUser userId={user.id} /> {/* Passing only userId */}
    </div>
  )
}
