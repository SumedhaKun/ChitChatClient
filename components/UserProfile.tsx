'use client'

import Link from 'next/link'
import type { Contact } from '@/types'

interface UserProfileProps {
  user: Contact
  onClose: () => void
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4">
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex flex-col items-center pb-6 px-6">
          {/* Avatar */}
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-500"
          />

          {/* User Info */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {user.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">@{user.username}</p>

          {/* Status Badge */}
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
              user.status === 'online'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {user.status === 'online' ? '● Online' : '○ Offline'}
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <Link
              href={`/chat/${user.id}`}
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center block"
            >
              Send Message
            </Link>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}