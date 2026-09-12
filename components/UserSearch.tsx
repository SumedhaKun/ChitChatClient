'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@/types'

interface UserSearchProps {
  users: User[]
  onSelectUser: (user: User) => void
}

export default function UserSearch({ users, onSelectUser }: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []

    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(trimmed) ||
        user.name.toLowerCase().includes(trimmed)
    )
  }, [query, users])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (user: User) => {
    onSelectUser(user)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative px-6 py-3 bg-gray-900 border-b border-gray-800">
      <div className="relative max-w-xl">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search users by username..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isOpen && query.trim() && (
        <div className="absolute left-6 right-6 top-full mt-1 max-w-xl bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <ul>
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition text-left"
                  >
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-gray-500">No users found</p>
          )}
        </div>
      )}
    </div>
  )
}
