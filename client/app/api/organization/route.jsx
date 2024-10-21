// filename: app/api/organization/route.jsx

import prisma from '../../libs/prismadb'
import axios from 'axios'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'

// Helper function to fetch LinkedIn organizations
export async function getOrganizations(
  accessToken,
  linkedInVersion,
  organizationIds = [],
  userId // Added userId parameter
) {
  try {
    // Ensure organizationIds is an array and has at least one ID
    if (!Array.isArray(organizationIds) || organizationIds.length === 0) {
      throw new Error('No organization IDs provided')
    }

    // Format the organization IDs as a comma-separated string
    const organizationIdList = `List(${organizationIds.join(',')})`

    const response = await axios.get(
      `https://api.linkedin.com/rest/organizationsLookup?ids=${organizationIdList}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': linkedInVersion,
        },
      }
    )

    // Check if the response contains 'results'
    const organizationResults = response.data?.results || {}
    const orgIds = Object.keys(organizationResults) // Extract the organization IDs from the response
    if (!orgIds.length) {
      console.log('No organization data found')
      return [] // Return an empty array if no organizations found
    }

    // Map over the organization IDs and create the organization objects
    const organizations = orgIds.map((id) => {
      const orgData = organizationResults[id]
      return {
        organizationId: id,
        name:
          orgData.name.localized?.[
            orgData.name.preferredLocale.language +
              '_' +
              orgData.name.preferredLocale.country
          ] || null,
        localizedName: orgData.localizedName || null,
        industries: orgData.industries || [],
        foundedYear: orgData.foundedYear || null,
        headquarters: orgData.headquarters || null,
        websiteUrl: orgData.localizedWebsite || null,
        employeeCountRange: orgData.employeeCountRange || null,
        specialties: orgData.specialties || [],
        primaryOrganizationType: orgData.primaryOrganizationType || null,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        userId: userId, // Added userId
      }
    })

    // Separate organizations into create and update batches
    const existingOrganizations = await prisma.organization.findMany({
      where: {
        organizationId: { in: organizations.map((org) => org.organizationId) },
      },
    })

    const existingOrgIds = new Set(
      existingOrganizations.map((org) => org.organizationId)
    )

    const createOrganizations = organizations.filter(
      (org) => !existingOrgIds.has(org.organizationId)
    )
    const updateOrganizations = organizations.filter((org) =>
      existingOrgIds.has(org.organizationId)
    )

    // Perform batch create if there are organizations to create
    if (createOrganizations.length > 0) {
      await prisma.organization.createMany({
        data: createOrganizations,
      })
    }

    const updatePromises = updateOrganizations.map((org) => {
      return prisma.organization.update({
        where: { organizationId: org.organizationId },
        data: {
          name: org.name,
          localizedName: org.localizedName,
          foundedYear: org.foundedYear,
          headquarters: org.headquarters,
          websiteUrl: org.websiteUrl,
          employeeCountRange: org.employeeCountRange,
          specialties: org.specialties,
          primaryOrganizationType: org.primaryOrganizationType,
          lastModifiedAt: org.lastModifiedAt,
          userId: org.userId, // Ensure userId is updated
        },
      })
    })

    // Await all updates to complete
    await Promise.all(updatePromises)

    return organizations // Return the organizations after upsert
  } catch (error) {
    console.error(
      'Error fetching LinkedIn organizations:',
      error.response?.data || error.message
    )
    throw new Error(
      `Failed to fetch LinkedIn organizations: ${
        error.response?.data?.message || error.message
      }`
    )
  }
}

// POST request handler to fetch organizations based on IDs
export async function POST(request) {
  const { organizationIds } = await request.json()

  // Ensure organizationIds are provided
  if (!organizationIds || !organizationIds.length) {
    return new Response(
      JSON.stringify({ error: 'No organization IDs provided' }),
      { status: 400 }
    )
  }

  // Access the session to retrieve the access token
  const session = await getServerSession({ req: request, ...authOptions })
  if (!session) {
    return new Response(JSON.stringify({ error: 'Session not found' }), {
      status: 401,
    })
  }

  const accessToken = session?.user?.accessToken
  const linkedInVersion = process.env.LINKEDIN_API_VERSION
  const userId = session?.user?.id // Assuming userId is in session

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Access token not found' }), {
      status: 401, // Unauthorized
    })
  }

  try {
    const organizations = await getOrganizations(
      accessToken,
      linkedInVersion,
      organizationIds,
      userId // Pass userId to the function
    )
    return new Response(
      JSON.stringify({
        message: 'Organizations fetched successfully',
        data: organizations,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST handler:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
}
