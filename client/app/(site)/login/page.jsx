// filename: app/(site)/login/page.jsx

'use client'

import { useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const { data: session, status } = useSession() // Destructure session and status
  const router = useRouter()

  // Effect to handle redirection when the session is authenticated or unauthenticated
  useEffect(() => {
    if (status === 'authenticated') {
      // If authenticated, redirect to the homepage
      router.push('/')
    }
  }, [status, router])

  // If session status is still loading, show a loading state
  if (status === 'loading') {
    return <p>Loading...</p> // Display a simple loading message during session loading
  }

  return (
    <div className='login-container'>
      <div className='login-header'>
        <h2 className='login-title'>Sign in with LinkedIn</h2>
      </div>

      <div className='login-button-container'>
        <button
          onClick={() => signIn('linkedin')} // Trigger LinkedIn login
          className='login-button'
        >
          Sign In with LinkedIn
        </button>
      </div>
    </div>
  )
}
