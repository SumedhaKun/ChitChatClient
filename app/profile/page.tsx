'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { getMyProfile, updateMyProfile, type UserProfile } from '@/lib/userService'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [accessToken, setAccessToken] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/register')
        return
      }
      const loaded = await getMyProfile(data.session.access_token)
      if (!loaded) {
        router.replace('/onboarding')
        return
      }
      setAccessToken(data.session.access_token)
      setProfile(loaded)
    }
    load().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Unable to load profile')
    })
  }, [router])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.replace('/register')
    router.refresh()
  }

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profile || !accessToken) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const updated = await updateMyProfile(accessToken, {
        name: String(form.get('name') ?? ''),
        username: String(form.get('username') ?? ''),
        bio: String(form.get('bio') ?? '') || null,
        profilePic: String(form.get('profilePic') ?? '') || null,
      })
      setProfile(updated)
      setEditing(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 text-white px-6 py-4 shadow-md border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wide">ChitChat</h1>
      </header>

      <div className="max-w-xl mx-auto mt-10 p-8 bg-gray-900 border border-gray-800 rounded-lg text-center">
        {error && <p className="text-red-400">{error}</p>}
        {!profile && !error && <p className="text-gray-400">Loading profile…</p>}
        {profile && (
          <>
        {editing ? (
          <form onSubmit={saveProfile} className="space-y-3 text-left">
            <input name="name" required defaultValue={profile.name} placeholder="Display name" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
            <input name="username" required defaultValue={profile.username} placeholder="Username" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
            <input name="profilePic" defaultValue={profile.profilePic ?? ''} placeholder="Profile picture URL" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
            <textarea name="bio" defaultValue={profile.bio ?? ''} placeholder="Bio" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
            <div className="flex gap-3">
              <button disabled={saving} className="flex-1 py-2 bg-blue-600 rounded-lg">{saving ? 'Saving…' : 'Save'}</button>
              <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2 bg-gray-800 rounded-lg">Cancel</button>
            </div>
          </form>
        ) : (
          <>
        <img
          src={profile.profilePic ?? 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
          alt={profile.name}
          className="w-28 h-28 rounded-full mx-auto mb-5 object-cover border-2 border-gray-700"
        />
        <h1 className="text-2xl font-bold text-gray-100 mb-1">{profile.name}</h1>
        <p className="text-gray-400 mb-2">@{profile.username}</p>
        <p className="text-gray-400 mb-2">{profile.email}</p>
        {profile.bio && <p className="text-gray-300 mb-8">{profile.bio}</p>}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ← Back to Messages
          </Link>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-block px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-100 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>
          </>
        )}
          </>
        )}
      </div>
    </div>
  )
}
