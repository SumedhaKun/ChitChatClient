'use client'

import { useState } from 'react'
import type { User } from '@/types'

interface CreateGroupModalProps {
  users: User[]
  onClose: () => void
  onCreate: (name: string, memberIds: string[]) => void
}

export default function CreateGroupModal({ users, onClose, onCreate }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (groupName.trim() && selectedIds.length >= 2) {
      onCreate(groupName.trim(), selectedIds)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">Create Group Chat</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-300 mb-1.5">
              Group name
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Project Team"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">
              Select members ({selectedIds.length} selected)
            </p>
            <ul className="max-h-48 overflow-y-auto space-y-1 border border-gray-800 rounded-lg">
              {users.map((user) => (
                <li key={user.id}>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 cursor-pointer rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <img src={user.profilePic} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-1.5">Select at least 2 members</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || selectedIds.length < 2}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
