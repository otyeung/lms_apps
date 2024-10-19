// app/(site)/dashboard/page.jsx

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import DeleteUser from '../../component/deleteUser' // Adjust the path as necessary

const Dashboard = () => {
  const { data: session } = useSession()
  const [user, setUser] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch(`/api/checkUser?id=${session.user.id}`)
        if (!response.ok) {
          throw new Error('Error fetching user data')
        }
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        setErrorMessage(`Error fetching user data: ${error.message}`)
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
      const response = await fetch('/api/deleteUser', {
        // Updated the API endpoint to match your route
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const message = await response.text()
        console.log(message)
        signOut() // Sign out after successful deletion
      } else {
        const error = await response.text()
        setErrorMessage(`Error deleting user: ${error}`)
      }
    } catch (error) {
      setErrorMessage(`Unexpected error: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <h1>LMS Apps</h1>
      {user ? (
        <div>
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
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

export default Dashboard
