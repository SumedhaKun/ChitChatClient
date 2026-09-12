'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getUserByUsername } from '@/data/users'

export default function ContactPage() {
  const params = useParams()
  const username = params.username as string
  const user = getUserByUsername(username)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">User not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Messages
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 text-white px-6 py-4 shadow-md border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wide">ChitChat</h1>
      </header>

      <div className="max-w-xl mx-auto mt-10 p-8 bg-gray-900 border border-gray-800 rounded-lg text-center">
        <img
          src={user.profilePic}
          alt={user.name}
          className="w-28 h-28 rounded-full mx-auto mb-5 object-cover border-2 border-gray-700"
        />
        <h1 className="text-2xl font-bold text-gray-100 mb-1">{user.name}</h1>
        <p className="text-gray-400 mb-4">@{user.username}</p>
        <p className={`text-sm mb-4 ${user.activityStatus === 'online' ? 'text-green-400' : 'text-gray-500'}`}>
          {user.activityStatus === 'online' ? '● Online' : '○ Offline'}
        </p>
        {user.bio && <p className="text-gray-300 mb-8">{user.bio}</p>}

        <Link
          href="/"
          className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          ← Back to Messages
        </Link>
      </div>
    </div>
  )
}
