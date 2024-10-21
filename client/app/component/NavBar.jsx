// app/component/NavBar.jsx

'use client'

import React from 'react'
import Link from 'next/link'

const NavBar = () => {
  return (
    <nav>
      <ul
        style={{
          display: 'flex',
          listStyle: 'none',
          padding: '10px',
          backgroundColor: '#f0f0f0',
        }}
      >
        <li style={{ marginRight: '15px' }}>
          <Link href='/'>Account</Link>
        </li>
        <li style={{ marginRight: '15px' }}>
          <Link href='/user'>User</Link>
        </li>
        <li>
          <Link href='/logout'>Logout</Link>
        </li>
      </ul>
    </nav>
  )
}

export default NavBar
