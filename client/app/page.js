// filename: app/page.js

import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import prisma from './libs/prismadb'
import { getAdAccounts } from './api/adAccount/route'
import AdAccount from './component/adAccount' // Import the AdAccount component
import Calendar from './component/calendar' // Import the Calendar component

export default async function Home() {
  const session = await getServerSession(authOptions)
  //console.log(session)
  const account = await prisma.account.findFirst({
    where: {
      userId: session?.user?.id,
      provider: 'linkedin',
    },
    select: {
      userId: true,
      providerAccountId: true,
      access_token: true,
    },
  })

  let adAccounts = []

  if (account) {
    const accessToken = account.access_token
    const linkedInVersion = process.env.LINKEDIN_API_VERSION
    try {
      adAccounts = await getAdAccounts(
        accessToken,
        linkedInVersion,
        account.userId
      )
    } catch (error) {
      console.error('Error syncing LinkedIn ad accounts:', error)
    }
  }

  // Destructure user details from the session object
  const user = session?.user || {}
  //  console.log('account.userId', account.userId)
  return (
    <section>
      <h1>Report Downloader</h1>
      {/* Display user's name */}
      <div>
        <p>
          <strong>Logged in user :</strong> {user.name}
        </p>
      </div>

      {/* Render the Calendar component above the AdAccount component */}
      {/* Pass userId to the Calendar component */}
      <Calendar userId={account.userId} />

      {/* Render the AdAccount component */}
      <AdAccount adAccounts={adAccounts} />
    </section>
  )
}
