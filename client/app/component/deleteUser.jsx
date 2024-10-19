// filename: app/component/DeleteUser.jsx

'use client' // Mark this component as a client component

import React from 'react'
import axios from 'axios'

const DeleteUser = ({ userId, onDeleteSuccess }) => {
  const handleDelete = async () => {
    try {
      const response = await axios.delete('/api/deleteUser', {
        data: { userId }, // Axios requires the body data to be passed in the `data` key for DELETE requests
      })

      console.log(response.data.message) // Success message
      onDeleteSuccess() // Callback for successful deletion
    } catch (error) {
      console.error('Error deleting user:', error)
      // Handle the error as needed, e.g., set error state
    }
  }

  return <button onClick={handleDelete}>Delete Account</button>
}

export default DeleteUser
