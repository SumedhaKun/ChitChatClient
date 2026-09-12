'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/register')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 text-white px-6 py-4 shadow-md border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wide">ChitChat</h1>
      </header>

      <div className="max-w-xl mx-auto mt-10 p-8 bg-gray-900 border border-gray-800 rounded-lg text-center">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
          alt="Profile"
          className="w-28 h-28 rounded-full mx-auto mb-5 object-cover border-2 border-gray-700"
        />
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Your Profile</h1>
        <p className="text-gray-400 mb-2">Username: User123</p>
        <p className="text-gray-400 mb-2">Email: user@example.com</p>
        <p className="text-green-400 mb-2">Status: Online</p>
        <p className="text-gray-400 mb-8">Joined: January 2024</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ← Back to Messages
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-block px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-100 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
