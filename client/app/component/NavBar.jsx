// app/component/NavBar.jsx

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
          <Link href='/'>Home</Link>
        </li>
        <li style={{ marginRight: '15px' }}>
          <Link href='/dashboard'>Dashboard</Link>
        </li>
        <li style={{ marginRight: '15px' }}>
          <Link href='/adAccount'>Ad Account</Link>
        </li>
        <li>
          <Link href='/logout'>Logout</Link>
        </li>
      </ul>
    </nav>
  )
}

export default NavBar
