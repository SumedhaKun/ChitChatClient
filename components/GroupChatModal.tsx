'use client'

import React, { useState } from 'react'
import type { Contact, GroupChat } from '@/types'

interface GroupChatModalProps {
  contacts: Contact[]
  onCreateGroup: (group: GroupChat) => void
  onClose: () => void
}

export default function GroupChatModal({
  contacts,
  onCreateGroup,
  onClose,
}: GroupChatModalProps) {
  const [groupName, setGroupName] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedContacts.length === 0) {
      alert('Please enter a group name and select at least one contact')
      return
    }

    const selectedMembers = contacts.filter((c) =>
      selectedContacts.includes(c.id)
    )

    const newGroup: GroupChat = {
      id: Math.random(),
      name: groupName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${groupName}`,
      members: selectedMembers,
      isGroup: true,
    }

    onCreateGroup(newGroup)
    setGroupName('')
    setSelectedContacts([])
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Create Group Chat
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Contact Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Contacts ({selectedContacts.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {contacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => handleSelectContact(contact.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-8 h-8 rounded-full object-cover ml-3"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {contact.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{contact.username}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      contact.status === 'online'
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {contact.status === 'online' ? '●' : '○'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!groupName.trim() || selectedContacts.length === 0}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}