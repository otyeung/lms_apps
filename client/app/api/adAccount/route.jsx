// filename: app/api/adAccount/route.jsx

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma' // Adjust the import based on your project structure
import axios from 'axios'

export async function GET(req, { params }) {
  try {
    const session = await getSession() // Ensure you have a session management
    const account = await prisma.account.findFirst({
      where: {
        userId: session?.user?.id, // Assumes userId is available in the session object
        provider: 'linkedin', // Fetch specifically LinkedIn account
      },
      select: {
        access_token: true, // Fetch access token
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'No LinkedIn account found' },
        { status: 404 }
      )
    }

    const linkedInVersion = process.env.LINKEDIN_API_VERSION // LinkedIn API version from environment variable
    const accessToken = account.access_token // Get the access token

    // Fetch ad accounts from LinkedIn API
    const response = await axios.get(
      'https://api.linkedin.com/rest/adAccounts?q=search',
      {
        headers: {
          'LinkedIn-Version': linkedInVersion,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const adAccounts = response.data.elements // Extract the ad accounts data

    // Sync the data with the Prisma database
    for (const adAccount of adAccounts) {
      await prisma.adAccount.upsert({
        where: {
          adAccountId: adAccount.id, // Ensure matching by the LinkedIn adAccount ID
        },
        update: {
          test: adAccount.test,
          totalBudgetCurrencyCode: adAccount.totalBudget.currencyCode,
          totalBudgetAmount: adAccount.totalBudget.amount,
          notifiedOnCreativeRejection: adAccount.notifiedOnCreativeRejection,
          notifiedOnNewFeaturesEnabled: adAccount.notifiedOnNewFeaturesEnabled,
          notifiedOnEndOfCampaign: adAccount.notifiedOnEndOfCampaign,
          servingStatuses: adAccount.servingStatuses,
          type: adAccount.type,
          notifiedOnCampaignOptimization:
            adAccount.notifiedOnCampaignOptimization,
          versionTag: adAccount.version.versionTag,
          reference: adAccount.reference,
          notifiedOnCreativeApproval: adAccount.notifiedOnCreativeApproval,
          createdAt: new Date(adAccount.changeAuditStamps.created.time),
          createdActor: adAccount.changeAuditStamps.created.actor,
          lastModifiedAt: new Date(
            adAccount.changeAuditStamps.lastModified.time
          ),
          lastModifiedActor: adAccount.changeAuditStamps.lastModified.actor,
          name: adAccount.name,
          currency: adAccount.currency,
          status: adAccount.status,
          totalBudgetEndsAt: adAccount.totalBudgetEndsAt
            ? new Date(adAccount.totalBudgetEndsAt)
            : null,
        },
        create: {
          userId: session.user.id, // Link the ad account to the user
          test: adAccount.test,
          totalBudgetCurrencyCode: adAccount.totalBudget.currencyCode,
          totalBudgetAmount: adAccount.totalBudget.amount,
          notifiedOnCreativeRejection: adAccount.notifiedOnCreativeRejection,
          notifiedOnNewFeaturesEnabled: adAccount.notifiedOnNewFeaturesEnabled,
          notifiedOnEndOfCampaign: adAccount.notifiedOnEndOfCampaign,
          servingStatuses: adAccount.servingStatuses,
          type: adAccount.type,
          notifiedOnCampaignOptimization:
            adAccount.notifiedOnCampaignOptimization,
          versionTag: adAccount.version.versionTag,
          reference: adAccount.reference,
          notifiedOnCreativeApproval: adAccount.notifiedOnCreativeApproval,
          createdAt: new Date(adAccount.changeAuditStamps.created.time),
          createdActor: adAccount.changeAuditStamps.created.actor,
          lastModifiedAt: new Date(
            adAccount.changeAuditStamps.lastModified.time
          ),
          lastModifiedActor: adAccount.changeAuditStamps.lastModified.actor,
          name: adAccount.name,
          currency: adAccount.currency,
          adAccountId: adAccount.id,
          status: adAccount.status,
          totalBudgetEndsAt: adAccount.totalBudgetEndsAt
            ? new Date(adAccount.totalBudgetEndsAt)
            : null,
        },
      })
    }

    return NextResponse.json({ message: 'AdAccounts synced successfully' })
  } catch (error) {
    console.error('Error fetching or syncing LinkedIn ad accounts:', error)
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 }
    )
  }
}
