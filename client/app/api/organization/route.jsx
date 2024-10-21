// filename: app/api/organization/route.jsx

import prisma from '../../libs/prismadb'
import axios from 'axios'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'

// Helper function to fetch LinkedIn organizations
export async function getOrganizations(
  accessToken,
  linkedInVersion,
  organizationIds = []
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
      return []
    }

    // Map over the organization IDs and create the organization objects
    const organizations = orgIds.map((id) => {
      const orgData = organizationResults[id]
      return {
        organizationId: id, // The key is the organization ID
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
        websiteUrl: orgData.localizedWebsite || null, // Use 'localizedWebsite' instead of 'websiteUrl'
        employeeCountRange: orgData.employeeCountRange || null,
        specialties: orgData.specialties || [],
        primaryOrganizationType: orgData.primaryOrganizationType || null, // Fetching primaryOrganizationType
        createdAt: new Date().toISOString(), // No 'changeAuditStamps' in the provided response, default to current time
        lastModifiedAt: new Date().toISOString(), // Same as above
      }
    })

    // Upsert logic
    const upsertPromises = organizations.map((org) => {
      return prisma.organization.upsert({
        where: { organizationId: org.organizationId },
        create: {
          organizationId: org.organizationId,
          name: org.name,
          localizedName: org.localizedName,
          foundedYear: org.foundedYear,
          headquarters: org.headquarters,
          websiteUrl: org.websiteUrl,
          employeeCountRange: org.employeeCountRange,
          specialties: org.specialties,
          primaryOrganizationType: org.primaryOrganizationType,
          createdAt: org.createdAt,
          lastModifiedAt: org.lastModifiedAt,
        },
        update: {
          name: org.name,
          localizedName: org.localizedName,
          foundedYear: org.foundedYear,
          headquarters: org.headquarters,
          websiteUrl: org.websiteUrl,
          employeeCountRange: org.employeeCountRange,
          specialties: org.specialties,
          primaryOrganizationType: org.primaryOrganizationType,
          lastModifiedAt: org.lastModifiedAt,
        },
      })
    })

    // Await all upserts to complete
    await Promise.all(upsertPromises)

    return organizations
  } catch (error) {
    console.error('Error fetching LinkedIn organizations:', error)
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

  // Access the session to retrieve the access token
  const session = await getServerSession({ req: request, ...authOptions }) // Using getServerSession correctly
  const accessToken = session?.user?.accessToken // Ensure this matches your session structure
  const linkedInVersion = process.env.LINKEDIN_API_VERSION

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Access token not found' }), {
      status: 401, // Unauthorized
    })
  }

  try {
    // Fetch organizations using the helper function
    const organizations = await getOrganizations(
      accessToken,
      linkedInVersion,
      organizationIds
    )
    return new Response(JSON.stringify(organizations), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
}
