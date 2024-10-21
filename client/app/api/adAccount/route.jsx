// filename: app/api/adAccount/route.jsx

import prisma from '../../libs/prismadb'
import axios from 'axios'

export async function getAdAccounts(accessToken, linkedInVersion, userId) {
  try {
    let adAccounts = []
    let nextPageToken = null

    do {
      const response = await axios.get(
        `https://api.linkedin.com/rest/adAccounts?q=search${
          nextPageToken ? `&pageToken=${nextPageToken}` : ''
        }`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': linkedInVersion,
          },
        }
      )

      // Log the API call made
      /*       console.log('Fetching LinkedIn ad accounts:', {
        url: `https://api.linkedin.com/rest/adAccounts?q=search${
          nextPageToken ? `&pageToken=${nextPageToken}` : ''
        }`,
        response: response.data,
      }) */

      // Process the response
      const fetchedAccounts = response.data.elements.map((account) => ({
        adAccountId: String(account.id),
        userId: userId || null,
        test: account.test,
        totalBudgetCurrencyCode: account.totalBudget
          ? account.totalBudget.currencyCode
          : null,
        totalBudgetAmount: account.totalBudget
          ? parseFloat(account.totalBudget.amount)
          : null,
        notifiedOnCreativeRejection: account.notifiedOnCreativeRejection,
        notifiedOnNewFeaturesEnabled: account.notifiedOnNewFeaturesEnabled,
        notifiedOnEndOfCampaign: account.notifiedOnEndOfCampaign,
        servingStatuses: account.servingStatuses || [],
        type: account.type,
        versionTag: account.version ? account.version.versionTag : null,
        reference: account.reference,
        notifiedOnCreativeApproval: account.notifiedOnCreativeApproval,
        createdAt: new Date(
          account.changeAuditStamps?.created?.time
        ).toISOString(), // Explicit UTC
        createdActor: account.changeAuditStamps?.created?.actor || null,
        lastModifiedAt: new Date(
          account.changeAuditStamps?.lastModified?.time
        ).toISOString(), // Explicit UTC
        lastModifiedActor:
          account.changeAuditStamps?.lastModified?.actor || null,
        name: account.name,
        currency: account.currency,
        status: account.status,
        totalBudgetEndsAt: account.totalBudgetEndsAt
          ? new Date(account.totalBudgetEndsAt).toISOString() // Explicit UTC
          : null,
      }))

      adAccounts = [...adAccounts, ...fetchedAccounts]

      // Get the next page token from the response metadata
      nextPageToken = response.data.metadata?.nextPageToken || null
    } while (nextPageToken)

    // Sync with the database
    for (const account of adAccounts) {
      // Check if the ad account already exists
      const existingAdAccount = await prisma.adAccount.findUnique({
        where: { adAccountId: account.adAccountId }, // Look for existing account by adAccountId
      })

      const upsertData = {
        where: existingAdAccount
          ? { id: existingAdAccount.id } // Use existing account's id if it exists
          : { adAccountId: account.adAccountId }, // Otherwise create a new one based on adAccountId
        create: {
          adAccountId: account.adAccountId,
          userId: userId,
          test: account.test,
          totalBudgetCurrencyCode: account.totalBudgetCurrencyCode,
          totalBudgetAmount: account.totalBudgetAmount,
          notifiedOnCreativeRejection: account.notifiedOnCreativeRejection,
          notifiedOnNewFeaturesEnabled: account.notifiedOnNewFeaturesEnabled,
          notifiedOnEndOfCampaign: account.notifiedOnEndOfCampaign,
          servingStatuses: account.servingStatuses,
          type: account.type,
          versionTag: account.versionTag,
          reference: account.reference,
          notifiedOnCreativeApproval: account.notifiedOnCreativeApproval,
          createdAt: account.createdAt,
          createdActor: account.createdActor,
          lastModifiedAt: account.lastModifiedAt,
          lastModifiedActor: account.lastModifiedActor,
          name: account.name,
          currency: account.currency,
          status: account.status,
          totalBudgetEndsAt: account.totalBudgetEndsAt,
        },
        update: {
          test: account.test,
          totalBudgetCurrencyCode: account.totalBudgetCurrencyCode,
          totalBudgetAmount: account.totalBudgetAmount,
          notifiedOnCreativeRejection: account.notifiedOnCreativeRejection,
          notifiedOnNewFeaturesEnabled: account.notifiedOnNewFeaturesEnabled,
          notifiedOnEndOfCampaign: account.notifiedOnEndOfCampaign,
          servingStatuses: account.servingStatuses,
          type: account.type,
          versionTag: account.versionTag,
          reference: account.reference,
          notifiedOnCreativeApproval: account.notifiedOnCreativeApproval,
          createdAt: account.createdAt,
          createdActor: account.createdActor,
          lastModifiedAt: account.lastModifiedAt,
          lastModifiedActor: account.lastModifiedActor,
          name: account.name,
          currency: account.currency,
          status: account.status,
          totalBudgetEndsAt: account.totalBudgetEndsAt,
        },
      }

      await prisma.adAccount.upsert(upsertData)
    }

    return adAccounts
  } catch (error) {
    console.error('Error fetching LinkedIn ad accounts:', error)
    throw new Error(
      `Failed to fetch LinkedIn ad accounts: ${
        error.response?.data?.message || error.message
      }`
    )
  }
}
