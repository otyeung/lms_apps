import { Inter } from 'next/font/google'
import './globals.css'
import Provider from './context/AuthContext'
import ToasterContext from './context/ToasterContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LinkedIn Report',
  description: 'Download Campaign Manager reports from LinkedIn',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Provider>
          <ToasterContext />
          {children}
        </Provider>
      </body>
    </html>
  )
}
