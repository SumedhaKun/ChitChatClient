'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { createMyProfile, getMyProfile } from '@/lib/userService'

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [profilePic, setProfilePic] = useState<string | undefined>()
  const [accessToken, setAccessToken] = useState<string>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/register')
        return
      }

      const existing = await getMyProfile(data.session.access_token)
      if (existing) {
        router.replace('/')
        return
      }

      const metadata = data.session.user.user_metadata
      setName(metadata.full_name ?? metadata.name ?? '')
      setProfilePic(metadata.avatar_url)
      setAccessToken(data.session.access_token)
      setLoading(false)
    }

    load().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Unable to load your account')
      setLoading(false)
    })
  }, [router])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!accessToken) return

    setError('')
    setLoading(true)
    try {
      await createMyProfile(accessToken, {
        username,
        name,
        ...(profilePic ? { profile_pic: profilePic } : {}),
      })
      router.replace('/')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create profile')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md p-8 bg-gray-900 border border-gray-800 rounded-xl space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Finish your profile</h1>
          <p className="mt-1 text-gray-400">Choose how people will find you.</p>
        </div>

        <label className="block text-sm text-gray-300">
          Display name
          <input
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg"
          />
        </label>

        <label className="block text-sm text-gray-300">
          Username
          <input
            required
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_]+"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="your_username"
            className="mt-1 w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg"
        >
          {loading ? 'Loading…' : 'Create profile'}
        </button>
      </form>
    </main>
  )
}
