// filename: app/component/AdAccount.jsx

'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

// AdAccount component to display the ad accounts table
const AdAccount = ({ adAccounts }) => {
  // State for checkbox filters (status, type, and serving statuses)
  const [filters, setFilters] = useState({
    DRAFT: false,
    CANCELED: false,
    PENDING_DELETION: false,
    REMOVED: false,
    ACTIVE: true, // By default, ACTIVE is checked
    BUSINESS: true, // By default, BUSINESS is checked
    ENTERPRISE: true, // By default, ENTERPRISE is checked
    // Serving statuses
    RUNNABLE: true, // By default, RUNNABLE is checked
    STOPPED: true,
    BILLING_HOLD: true,
    ACCOUNT_TOTAL_BUDGET_HOLD: true,
    ACCOUNT_END_DATE_HOLD: true,
    RESTRICTED_HOLD: true,
    INTERNAL_HOLD: true,
  })

  // State to hold organizations and loading status
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // Added error state

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        if (Array.isArray(adAccounts) && adAccounts.length > 0) {
          // Extract organization IDs from ad accounts
          const organizationIds = adAccounts.map((account) =>
            account.reference
              .replace('urn:li:organization:', '')
              .replace('urn:li:organizationBrand:', '')
          )
          console.log('Organization IDs being sent:', organizationIds) // Log organization IDs

          const response = await axios.post('/api/organization', {
            organizationIds,
          })
          console.log('Response from API:', response.data) // Log the response
          setOrganizations(response.data.data) // Ensure this is set correctly based on your API response structure
        } else {
          console.warn('adAccounts is not an array or is empty')
        }
      } catch (error) {
        console.error('Error fetching organizations:', error)
        setError('Failed to fetch organizations') // Set error state
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [adAccounts])

  // Function to handle checkbox changes
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }))
  }

  // Filter ad accounts based on the selected statuses, types, and serving statuses
  const filteredAdAccounts = adAccounts.filter((account) => {
    // Status-based filters
    const isActive = filters.ACTIVE && account.status === 'ACTIVE'
    const isDraft = filters.DRAFT && account.status === 'DRAFT'
    const isCanceled = filters.CANCELED && account.status === 'CANCELED'
    const isPendingDeletion =
      filters.PENDING_DELETION && account.status === 'PENDING_DELETION'
    const isRemoved = filters.REMOVED && account.status === 'REMOVED'

    // Type-based filters
    const isBusiness = filters.BUSINESS && account.type === 'BUSINESS'
    const isEnterprise = filters.ENTERPRISE && account.type === 'ENTERPRISE'

    // Serving status-based filters (checks if any of the account's servingStatuses match the selected filters)
    const hasSelectedServingStatus = account.servingStatuses.some(
      (status) => filters[status]
    )

    // Return accounts that match both status, type, and servingStatuses filters
    return (
      (isActive || isDraft || isCanceled || isPendingDeletion || isRemoved) &&
      (isBusiness || isEnterprise) &&
      hasSelectedServingStatus
    )
  })

  // Function to format date to 'YYYY-MM-DD' in UTC
  const formatDate = (date) => {
    if (!date) return 'N/A' // Return 'N/A' if no date is provided
    return new Date(date).toISOString().slice(0, 10) // Ensure UTC date format
  }

  // Function to format the servingStatuses array into a comma-separated string
  const formatServingStatuses = (statuses) => {
    if (!statuses || statuses.length === 0) return 'N/A'
    return statuses.join(', ')
  }

  // Helper function to get the organization name by ID
  const getOrganizationName = (orgId) => {
    if (!orgId) return 'N/A' // Handle empty orgId case
    const organization = organizations.find(
      (org) => org.organizationId === orgId
    )
    console.log(
      'Matching orgId:',
      orgId,
      'with organizationId:',
      organization?.organizationId
    ) // Log matching organization
    return organization ? organization.localizedName : 'N/A' // Return localizedName or 'N/A' if not found
  }

  return (
    <div>
      {/* Checkbox filters for status */}
      <div>
        <label>
          <input
            type='checkbox'
            name='ACTIVE'
            checked={filters.ACTIVE}
            onChange={handleCheckboxChange}
          />
          ACTIVE
        </label>
        <label>
          <input
            type='checkbox'
            name='DRAFT'
            checked={filters.DRAFT}
            onChange={handleCheckboxChange}
          />
          DRAFT
        </label>
        <label>
          <input
            type='checkbox'
            name='CANCELED'
            checked={filters.CANCELED}
            onChange={handleCheckboxChange}
          />
          CANCELED
        </label>
        <label>
          <input
            type='checkbox'
            name='PENDING_DELETION'
            checked={filters.PENDING_DELETION}
            onChange={handleCheckboxChange}
          />
          PENDING DELETION
        </label>
        <label>
          <input
            type='checkbox'
            name='REMOVED'
            checked={filters.REMOVED}
            onChange={handleCheckboxChange}
          />
          REMOVED
        </label>
      </div>

      {/* Checkbox filters for type */}
      <div>
        <label>
          <input
            type='checkbox'
            name='BUSINESS'
            checked={filters.BUSINESS}
            onChange={handleCheckboxChange}
          />
          BUSINESS
        </label>
        <label>
          <input
            type='checkbox'
            name='ENTERPRISE'
            checked={filters.ENTERPRISE}
            onChange={handleCheckboxChange}
          />
          ENTERPRISE
        </label>
      </div>

      {/* Checkbox filters for serving statuses */}
      <div>
        <label>
          <input
            type='checkbox'
            name='RUNNABLE'
            checked={filters.RUNNABLE}
            onChange={handleCheckboxChange}
          />
          RUNNABLE
        </label>
        <label>
          <input
            type='checkbox'
            name='STOPPED'
            checked={filters.STOPPED}
            onChange={handleCheckboxChange}
          />
          STOPPED
        </label>
        <label>
          <input
            type='checkbox'
            name='BILLING_HOLD'
            checked={filters.BILLING_HOLD}
            onChange={handleCheckboxChange}
          />
          BILLING HOLD
        </label>
        <label>
          <input
            type='checkbox'
            name='ACCOUNT_TOTAL_BUDGET_HOLD'
            checked={filters.ACCOUNT_TOTAL_BUDGET_HOLD}
            onChange={handleCheckboxChange}
          />
          ACCOUNT TOTAL BUDGET HOLD
        </label>
        <label>
          <input
            type='checkbox'
            name='ACCOUNT_END_DATE_HOLD'
            checked={filters.ACCOUNT_END_DATE_HOLD}
            onChange={handleCheckboxChange}
          />
          ACCOUNT END DATE HOLD
        </label>
        <label>
          <input
            type='checkbox'
            name='RESTRICTED_HOLD'
            checked={filters.RESTRICTED_HOLD}
            onChange={handleCheckboxChange}
          />
          RESTRICTED HOLD
        </label>
        <label>
          <input
            type='checkbox'
            name='INTERNAL_HOLD'
            checked={filters.INTERNAL_HOLD}
            onChange={handleCheckboxChange}
          />
          INTERNAL HOLD
        </label>
      </div>

      {/* Render the filtered ad accounts table */}
      {loading ? (
        <p>Loading organizations...</p>
      ) : error ? ( // Check for errors
        <p>{error}</p>
      ) : filteredAdAccounts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Ads Account ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Currency</th>
              <th>Total Budget</th>
              <th>Type</th>
              <th>Serving Statuses</th>
              <th>Created At</th>
              <th>Organization</th> {/* New header for Organization */}
            </tr>
          </thead>
          <tbody>
            {filteredAdAccounts.map((account) => (
              <tr key={account.adAccountId || account.id}>
                <td>{account.adAccountId}</td>
                <td>{account.name}</td>
                <td>{account.status}</td>
                <td>{account.currency}</td>
                <td>{account.totalBudget}</td>
                <td>{account.type}</td>
                <td>{formatServingStatuses(account.servingStatuses)}</td>
                <td>{formatDate(account.createdAt)}</td>
                <td>
                  {getOrganizationName(
                    account.reference.replace(
                      /urn:li:organization:|urn:li:organizationBrand:/g,
                      ''
                    )
                  )}
                </td>{' '}
                {/* Call the organization name retrieval */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No ad accounts match the selected filters.</p>
      )}
    </div>
  )
}

export default AdAccount
