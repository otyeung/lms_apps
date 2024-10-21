// filename: app/(site)/user/AccountDetailsClient.jsx
'use client' // Ensure this is at the very top

import { useState } from 'react'

function AccountDetailsClient({ account }) {
  const [showAccessToken, setShowAccessToken] = useState(false)

  const toggleAccessToken = () => setShowAccessToken(!showAccessToken)

  return (
    <div>
      <div>
        <p>
          <strong>Access Token:</strong>{' '}
          {showAccessToken ? account.access_token : '***********'}
          <button onClick={toggleAccessToken} className='toggle-button'>
            {showAccessToken ? 'Hide' : 'Show'}
          </button>
        </p>
      </div>
      <p>
        <strong>Access Token Expires At:</strong>{' '}
        {new Date(account.expires_at * 1000).toLocaleString()}
      </p>
      <p>
        <strong>Scope:</strong> {account.scope}
      </p>
    </div>
  )
}

export default AccountDetailsClient
