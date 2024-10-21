// filename: app/component/LogoutButton.jsx

'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut({ redirect: false }) // Prevent automatic redirect
    router.push('/login') // Manually redirect to login
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className='logout-button' // Use the CSS class for styling
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  )
}
