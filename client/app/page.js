import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import prisma from './libs/prismadb'
import { getAdAccounts } from './api/adAccount/route'
import AdAccount from './component/adAccount'
import Calendar from './component/calendar'
import { redirect } from 'next/navigation' // Import redirect

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    // Redirect to the login page if there's no session
    redirect('/login')
  }

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
  let errorMessage = null

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
      errorMessage =
        'There was an error syncing your LinkedIn ad accounts. Please try again later.'
    }
  }

  const user = session?.user || {}
  const userId = account ? account.userId : null // Safely access userId

  return (
    <section>
      <h1>Report Downloader</h1>
      <div>
        <p>
          <strong>Logged in user :</strong> {user.name}
        </p>
      </div>

      {userId ? (
        <>
          <Calendar userId={userId} />
          <AdAccount adAccounts={adAccounts} />
        </>
      ) : (
        <p>No account linked. Please connect your LinkedIn account.</p>
      )}

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </section>
  )
}
