// app/component/NavBar.jsx

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // Use usePathname
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const NavBar = () => {
  const pathname = usePathname() // Get the current path
  const router = useRouter()

  const handleLogout = async (event) => {
    event.preventDefault() // Prevent default link behavior
    await signOut({ redirect: false }) // Prevent automatic redirect
    router.push('/login') // Manually redirect to login
  }

  return (
    <nav>
      <ul className='nav'>
        <li className='navItem'>
          <Link href='/' className={pathname === '/' ? 'active' : ''}>
            Account
          </Link>
        </li>
        <li className='navItem'>
          <Link href='/user' className={pathname === '/user' ? 'active' : ''}>
            User
          </Link>
        </li>
        <li className='navItem'>
          <Link
            href='/login'
            onClick={handleLogout} // Handle logout on click
          >
            Logout
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default NavBar
