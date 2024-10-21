// filename: app/component/AdAccount.jsx

'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  const filteredAdAccounts = useMemo(() => {
    return adAccounts.filter((account) => {
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
  }, [adAccounts, filters])

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
      <fieldset>
        <legend>Status Filters</legend>
        {['ACTIVE', 'DRAFT', 'CANCELED', 'PENDING_DELETION', 'REMOVED'].map(
          (status) => (
            <label key={status} htmlFor={status}>
              <input
                type='checkbox'
                id={status}
                name={status}
                checked={filters[status]}
                onChange={handleCheckboxChange}
              />
              {status.replace('_', ' ')}
            </label>
          )
        )}
      </fieldset>

      {/* Checkbox filters for type */}
      <fieldset>
        <legend>Type Filters</legend>
        {['BUSINESS', 'ENTERPRISE'].map((type) => (
          <label key={type} htmlFor={type}>
            <input
              type='checkbox'
              id={type}
              name={type}
              checked={filters[type]}
              onChange={handleCheckboxChange}
            />
            {type}
          </label>
        ))}
      </fieldset>

      {/* Checkbox filters for serving statuses */}
      <fieldset>
        <legend>Serving Status Filters</legend>
        {[
          'RUNNABLE',
          'STOPPED',
          'BILLING_HOLD',
          'ACCOUNT_TOTAL_BUDGET_HOLD',
          'ACCOUNT_END_DATE_HOLD',
          'RESTRICTED_HOLD',
          'INTERNAL_HOLD',
        ].map((status) => (
          <label key={status} htmlFor={status}>
            <input
              type='checkbox'
              id={status}
              name={status}
              checked={filters[status]}
              onChange={handleCheckboxChange}
            />
            {status.replace('_', ' ')}
          </label>
        ))}
      </fieldset>

      {/* Render the filtered ad accounts table */}
      {loading ? (
        <p>Loading organizations...</p>
      ) : error ? ( // Check for errors
        <p>{error}</p>
      ) : filteredAdAccounts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Account Name</th>
              <th>Status</th>
              <th>Currency</th>
              <th>Budget</th>
              <th>Type</th>
              <th>Serving Status</th>
              <th>Created Date</th>
              <th>Company Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdAccounts.map((account) => (
              <tr key={account.adAccountId || account.id}>
                <td>{account.adAccountId}</td>
                <td>{account.name}</td>
                <td>{account.status}</td>
                <td>{account.currency}</td>
                <td>{account.totalBudgetAmount}</td>
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
                </td>
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
