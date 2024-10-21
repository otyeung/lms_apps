// filename : app/layout.js

'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import Provider from './context/AuthContext'
import ToasterContext from './context/ToasterContext'
import NavBar from './component/NavBar'
import { usePathname } from 'next/navigation' // Keep this import
// Remove the metadata export from here

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const pathname = usePathname() // Get the current path
  const isLoginPage = pathname === '/login' // Check if it's the login page

  return (
    <html lang='en'>
      <body className={inter.className}>
        <Provider>
          <ToasterContext />
          {!isLoginPage && <NavBar />}{' '}
          {/* Render NavBar only if it's not the login page */}
          {children} {/* Render the main content */}
        </Provider>
      </body>
    </html>
  )
}
