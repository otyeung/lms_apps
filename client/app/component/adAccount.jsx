'use client' // This file will be a Client Component

import React, { useState } from 'react'

// AdAccount component to display the ad accounts table
const AdAccount = ({ adAccounts }) => {
  // State for checkbox filters
  const [filters, setFilters] = useState({
    DRAFT: false,
    CANCELED: false,
    PENDING_DELETION: false,
    REMOVED: false,
    ACTIVE: true, // By default, ACTIVE is checked
  })

  // Function to handle checkbox changes
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }))
  }

  // Filter ad accounts based on the selected statuses
  const filteredAdAccounts = adAccounts.filter((account) => {
    const isActive = filters.ACTIVE && account.status === 'ACTIVE'
    const isDraft = filters.DRAFT && account.status === 'DRAFT'
    const isCanceled = filters.CANCELED && account.status === 'CANCELED'
    const isPendingDeletion =
      filters.PENDING_DELETION && account.status === 'PENDING_DELETION'
    const isRemoved = filters.REMOVED && account.status === 'REMOVED'

    return isActive || isDraft || isCanceled || isPendingDeletion || isRemoved
  })

  // Function to format date to 'YYYY-MM-DD'
  const formatDate = (date) => {
    if (!date) return 'N/A' // Return 'N/A' if no date is provided
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
    return new Date(date)
      .toLocaleDateString('en-CA', options)
      .replace(/\//g, '-')
  }

  return (
    <div>
      {/* Checkbox filters */}
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

      {/* Render the filtered ad accounts table */}
      {filteredAdAccounts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Ads Account ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Currency</th>
              <th>Total Budget</th>
              <th>Type</th>
              <th>Created At</th> {/* New header for createdAt */}
            </tr>
          </thead>
          <tbody>
            {filteredAdAccounts.map((account) => (
              <tr key={account.adAccountId || account.id}>
                <td>{account.adAccountId}</td>
                <td>{account.name}</td>
                <td>{account.status}</td>
                <td>{account.currency}</td>
                <td>
                  {account.totalBudgetAmount
                    ? `${account.totalBudgetAmount}`
                    : 'N/A'}
                </td>
                <td>{account.type}</td>
                <td>{formatDate(account.createdAt)}</td>{' '}
                {/* Display formatted date */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No LinkedIn ad accounts found.</p>
      )}
    </div>
  )
}

export default AdAccount
