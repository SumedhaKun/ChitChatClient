'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserById } from '@/data/users'
import { createClient } from '@/lib/supabase/client'
import { getPublicProfile, type PublicUserProfile } from '@/lib/userService'

export default function ContactPage() {
  const params = useParams()
  const userId = params.username as string
  const [user, setUser] = useState<PublicUserProfile | null>()
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const configured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!configured && process.env.NODE_ENV === 'development') {
        const mock = getUserById(userId)
        setUser(mock ? {
          ...mock,
          profilePic: mock.profilePic,
          bio: mock.bio ?? null,
          createdAt: '',
          updatedAt: '',
        } : null)
        return
      }
      const { data } = await createClient().auth.getSession()
      if (!data.session) throw new Error('Sign in to view profiles')
      setUser(await getPublicProfile(data.session.access_token, userId))
    }
    load().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Unable to load profile')
      setUser(null)
    })
  }, [userId])

  if (user === undefined) {
    return <div className="min-h-screen bg-gray-950 grid place-items-center text-gray-400">Loading profile…</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">User not found</h1>
          {error && <p className="mb-3 text-red-400">{error}</p>}
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
          src={user.profilePic ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
          alt={user.name}
          className="w-28 h-28 rounded-full mx-auto mb-5 object-cover border-2 border-gray-700"
        />
        <h1 className="text-2xl font-bold text-gray-100 mb-1">{user.name}</h1>
        <p className="text-gray-400 mb-4">@{user.username}</p>
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
