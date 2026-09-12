'use client'

import React, { useState } from 'react'
import ChatWindow from '@/components/ChatWindow'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import type { Contact } from '@/types'

const mockContacts: Contact[] = [
  {
    id: 1,
    name: 'John Doe',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    id: 2,
    name: 'Jane Smith',
    status: 'offline',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  },
  {
    id: 4,
    name: 'Sarah Williams',
    status: 'offline',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
]

export default function Home() {
  const [selectedContact, setSelectedContact] = useState<Contact>(mockContacts[0])

  return (
    <div className="flex flex-col h-screen">
      <Header userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar contacts={mockContacts} selectedContact={selectedContact} onSelectContact={setSelectedContact} />
        <ChatWindow contact={selectedContact} />
      </div>
    </div>
  )
}