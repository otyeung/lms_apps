// filename: app/component/DeleteUser.jsx

'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import axios from 'axios'

const DeleteUser = ({ userId }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleDeleteUser = async () => {
    if (!userId) {
      setErrorMessage('User not found.')
      return
    }

    setIsDeleting(true)
    setErrorMessage('')

    try {
      await axios.delete('/api/deleteUser', {
        data: { userId },
      })
      signOut() // Sign out after successful deletion
    } catch (error) {
      setErrorMessage(
        `Error deleting user: ${error.response?.data || error.message}`
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <button
        className='delete-button'
        onClick={handleDeleteUser}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Clear Caches'}
      </button>
      {errorMessage && <p className='error-message'>{errorMessage}</p>}
    </div>
  )
}

export default DeleteUser
