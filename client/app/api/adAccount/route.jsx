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

    // Fetch existing accounts in a single query
    const existingAdAccounts = await prisma.adAccount.findMany({
      where: {
        adAccountId: { in: adAccounts.map((account) => account.adAccountId) },
      },
    })

    const existingAdAccountIds = new Set(
      existingAdAccounts.map((acc) => acc.adAccountId)
    )

    const upsertPromises = adAccounts.map(async (account) => {
      const accountData = {
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
      }

      const upsertData = {
        where: existingAdAccountIds.has(account.adAccountId)
          ? {
              id: existingAdAccounts.find(
                (acc) => acc.adAccountId === account.adAccountId
              ).id,
            }
          : { adAccountId: account.adAccountId },
        create: { ...accountData },
        update: { ...accountData },
      }

      return prisma.adAccount.upsert(upsertData)
    })

    await Promise.all(upsertPromises)

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
