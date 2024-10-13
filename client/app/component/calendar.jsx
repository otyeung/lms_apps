// filename: app/component/calendar.jsx
'use client' // Mark this component as a client component

import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import prisma from '../libs/prismadb' // Assuming you have access to the Prisma client in this component

const Calendar = ({ userId }) => {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [timeRange, setTimeRange] = useState('This quarter') // Default to 'This quarter'
  const [selectedRange, setSelectedRange] = useState('') // State for the selected date range text

  // Utility functions for date manipulation in UTC
  const getUTCDate = (daysOffset = 0) => {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() + daysOffset)
    date.setUTCHours(0, 0, 0, 0)
    return date
  }

  const getStartOfMonthUTC = () => {
    const date = new Date()
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  }

  const getEndOfMonthUTC = () => {
    const date = new Date()
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
  }

  const getStartOfQuarterUTC = () => {
    const date = new Date()
    const quarterStartMonth = Math.floor(date.getUTCMonth() / 3) * 3
    return new Date(Date.UTC(date.getUTCFullYear(), quarterStartMonth, 1))
  }

  const getEndOfQuarterUTC = () => {
    const date = new Date()
    const quarterEndMonth = Math.floor(date.getUTCMonth() / 3) * 3 + 2
    return new Date(Date.UTC(date.getUTCFullYear(), quarterEndMonth + 1, 0))
  }

  const getLastQuarterRange = () => {
    const date = new Date()
    const quarterStartMonth = Math.floor((date.getUTCMonth() - 3) / 3) * 3
    const start = new Date(
      Date.UTC(date.getUTCFullYear(), quarterStartMonth, 1)
    )
    const end = new Date(
      Date.UTC(date.getUTCFullYear(), quarterStartMonth + 3, 0)
    )
    return { start, end }
  }

  // Get today's date in UTC
  const getTodayUTC = () => {
    const today = new Date()
    return new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    )
  }

  // Fetch the earliest createdAt date from the AdAccount table for the given userId
  const getEarliestAdAccountDate = async () => {
    try {
      const earliestAccount = await prisma.adAccount.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      })
      return earliestAccount?.createdAt
        ? new Date(earliestAccount.createdAt)
        : null
    } catch (error) {
      console.error('Error fetching earliest AdAccount date:', error)
      return null
    }
  }

  // Update start and end dates based on time range selection
  useEffect(() => {
    let start, end
    switch (timeRange) {
      case 'Today':
        start = getUTCDate()
        end = getUTCDate()
        break
      case 'Yesterday':
        start = getUTCDate(-1)
        end = getUTCDate(-1)
        break
      case 'Last 7 days':
        start = getUTCDate(-6)
        end = getUTCDate()
        break
      case 'Last 30 days':
        start = getUTCDate(-29)
        end = getUTCDate()
        break
      case 'Last 90 days':
        start = getUTCDate(-89)
        end = getUTCDate()
        break
      case 'This month':
        start = getStartOfMonthUTC()
        end = getEndOfMonthUTC()
        break
      case 'Last month':
        start = new Date(
          Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 1)
        )
        end = new Date(
          Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 0)
        )
        break
      case 'This quarter':
        start = getStartOfQuarterUTC()
        end = getEndOfQuarterUTC()
        break
      case 'Last quarter':
        const lastQuarter = getLastQuarterRange()
        start = lastQuarter.start
        end = lastQuarter.end
        break
      case 'All Time':
        console.log('UserId:', userId) // Log the userId
        getEarliestAdAccountDate().then((earliestDate) => {
          console.log('Earliest Date:', earliestDate) // Log the earliest date
          if (earliestDate) {
            setStartDate(earliestDate)
            setEndDate(getTodayUTC())
            setSelectedRange(
              `Selected Date Range: ${earliestDate.toLocaleDateString(
                'en-US'
              )} to ${getTodayUTC().toLocaleDateString('en-US')}`
            )
          } else {
            console.warn('No AdAccount found for userId:', userId)
            setStartDate(null)
            setEndDate(null)
            setSelectedRange('No AdAccount data available.')
          }
        })
        return // Exit early since this is async
      default:
        break
    }

    if (start && end) {
      // Ensure end date doesn't exceed today
      const today = getTodayUTC()
      if (end > today) {
        end = today
      }
      setStartDate(start)
      setEndDate(end)
      setSelectedRange(
        `Selected Date Range: ${start.toLocaleDateString(
          'en-US'
        )} to ${end.toLocaleDateString('en-US')}`
      )
    }
  }, [timeRange])

  // Handle date range selection manually
  const handleDateChange = (start, end) => {
    // Ensure end date does not exceed today
    const today = getTodayUTC()
    if (end && end > today) {
      end = today
    }
    setStartDate(start)
    setEndDate(end)
    setTimeRange('Custom') // Switch to 'Custom' when user selects custom dates
    setSelectedRange(
      `Selected Date Range: ${start?.toLocaleDateString('en-US') || ''} to ${
        end?.toLocaleDateString('en-US') || ''
      }`
    )
  }

  return (
    <div className='calendar-container' style={{ padding: '20px' }}>
      <h2>Date Range</h2>
      <div>
        <label>
          <input
            type='radio'
            checked={timeRange === 'Today'}
            onChange={() => setTimeRange('Today')}
          />
          Today
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'Yesterday'}
            onChange={() => setTimeRange('Yesterday')}
          />
          Yesterday
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'Last 7 days'}
            onChange={() => setTimeRange('Last 7 days')}
          />
          Last 7 days
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'Last 30 days'}
            onChange={() => setTimeRange('Last 30 days')}
          />
          Last 30 days
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'Last 90 days'}
            onChange={() => setTimeRange('Last 90 days')}
          />
          Last 90 days
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'This month'}
            onChange={() => setTimeRange('This month')}
          />
          This month
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'Last month'}
            onChange={() => setTimeRange('Last month')}
          />
          Last month
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'This quarter'}
            onChange={() => setTimeRange('This quarter')}
          />
          This quarter
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'Last quarter'}
            onChange={() => setTimeRange('Last quarter')}
          />
          Last quarter
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'All Time'}
            onChange={() => setTimeRange('All Time')}
          />
          All Time
        </label>
        <label>
          <input
            type='radio'
            checked={timeRange === 'Custom'}
            onChange={() => setTimeRange('Custom')}
          />
          Custom
        </label>
      </div>
      <div>
        <DatePicker
          selected={startDate}
          onChange={(date) => handleDateChange(date, endDate)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText='Select start date'
          isClearable
          dateFormat='yyyy/MM/dd'
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => handleDateChange(startDate, date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText='Select end date'
          isClearable
          dateFormat='yyyy/MM/dd'
        />
      </div>
      <div>
        <p>{selectedRange}</p>
      </div>
    </div>
  )
}

export default Calendar
