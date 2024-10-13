// filename : app/page.js

import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import prisma from './libs/prismadb'
import axios from 'axios'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Fetch the user's LinkedIn account details based on the session user ID
  const account = await prisma.account.findFirst({
    where: {
      userId: session?.user?.id, // Assumes userId is available in the session object
      provider: 'linkedin', // Fetch specifically LinkedIn account
    },
    select: {
      providerAccountId: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
      refresh_token_expires_in: true,
      scope: true,
    },
  })

  let adAccounts = [] // Initialize variable for LinkedIn ad accounts

  if (account) {
    const accessToken = account.access_token // Get the access token
    const linkedInVersion = process.env.LINKEDIN_API_VERSION // Read LinkedIn API version from environment variable

    try {
      // Fetch LinkedIn ad accounts
      const response = await axios.get(
        'https://api.linkedin.com/rest/adAccounts?q=search',
        {
          headers: {
            'LinkedIn-Version': linkedInVersion,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      adAccounts = response.data.elements || [] // Store ad accounts in adAccounts variable
    } catch (error) {
      console.error('Error fetching LinkedIn ad accounts:', error)
    }
  }

  // Destructure user details from the session object
  const user = session?.user || {}

  return (
    <section>
      <h1>LinkedIn Report</h1>
      {/* Display user's name */}
      <div>
        <p>
          <strong>Logged in user :</strong> {user.name}
        </p>
      </div>

      {/* Render the ad accounts table */}
      <h2>Your LinkedIn Ad Accounts</h2>
      {adAccounts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Currency</th>
              <th>Total Budget</th>
            </tr>
          </thead>
          <tbody>
            {adAccounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.name}</td>
                <td>{account.status}</td> {/* Status column */}
                <td>{account.currency}</td>
                <td>
                  {
                    account.totalBudget
                      ? `${account.totalBudget.amount} ${account.totalBudget.currencyCode}`
                      : 'N/A' // Fallback if totalBudget is undefined
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No LinkedIn ad accounts found.</p>
      )}
    </section>
  )
}
