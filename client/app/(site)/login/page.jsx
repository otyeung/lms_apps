'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function Login() {
  const session = useSession()
  const router = useRouter()
  const [data, setData] = useState({
    email: '',
    password: '',
  })

  // protecting the page, allowing only unauthenticated users
  useEffect(() => {
    if (session?.status === 'authenticated') {
      router.push('/dashboard')
    }
  })

  const loginUser = async (e) => {
    e.preventDefault()
    signIn('credentials', { ...data, redirect: false }).then((callback) => {
      if (callback?.error) {
        toast.error(callback.error)
      }

      if (callback?.ok && !callback?.error) {
        toast.success('Logged in successfully!')
      }
    })
  }
  return (
    <>
      <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
          <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
            Sign in to your account
          </h2>
        </div>

        <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
          <h1>Sign in with LinkedIn profile</h1>
          <button
            onClick={() => signIn('linkedin')}
            className='bg-blue-500 text-white w-full'
          >
            Sign In
          </button>
        </div>
      </div>
    </>
  )
}
