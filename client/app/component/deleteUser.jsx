// component/DeleteUser.jsx

import React from 'react'

const DeleteUser = ({ userId, onDeleteSuccess }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch('/api/deleteUser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(`Error deleting user: ${errorMessage}`)
      }

      const data = await response.json()
      console.log(data.message) // Success message
      onDeleteSuccess() // Callback for successful deletion
    } catch (error) {
      console.error('Error deleting user:', error)
      // Handle the error as needed, e.g., set error state
    }
  }

  return <button onClick={handleDelete}>Delete Account</button>
}

export default DeleteUser
