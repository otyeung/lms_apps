// app/(site)/dashboard/page.jsx

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import axios from 'axios' // Import axios
import DeleteUser from '../../component/DeleteUser' // Adjust the path as necessary

const User = () => {
  const { data: session } = useSession()
  const [user, setUser] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return

      try {
        const response = await axios.get(`/api/checkUser`, {
          params: { id: session.user.id },
        })

        setUser(response.data)
      } catch (error) {
        setErrorMessage(
          `Error fetching user data: ${error.response?.data || error.message}`
        )
      }
    }

    fetchUserData()
  }, [session])

  const handleDeleteUser = async () => {
    const userId = session?.user?.id

    if (!userId) {
      setErrorMessage('User not found.')
      return
    }

    setIsDeleting(true)
    setErrorMessage('')

    try {
      const response = await axios.delete('/api/deleteUser', {
        data: { userId }, // Pass userId in the body for DELETE request
      })

      console.log(response.data)
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
      <h1>Current User</h1>
      {user ? (
        <div>
          <p>User ID: {user.id}</p>
          <p>Name : {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Image: {user.image}</p>
          <p>Created At: {new Date(user.createdAt).toLocaleString()}</p>
          <p>Updated At: {new Date(user.updatedAt).toLocaleString()}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <button onClick={() => signOut()}>Sign Out</button>
      <DeleteUser
        userId={session?.user?.id}
        onDeleteSuccess={() => signOut()}
      />
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  )
}

export default User
