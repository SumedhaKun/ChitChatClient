'use client'

import { useState } from 'react'
import ChatWindow from '@/components/ChatWindow'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import UserSearch from '@/components/UserSearch'
import { allUsers, initialContacts } from '@/data/mockUsers'
import type { Contact } from '@/types'

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [selectedContact, setSelectedContact] = useState<Contact>(initialContacts[0])

  const handleSelectUser = (user: Contact) => {
    setContacts((prev) => (prev.some((c) => c.id === user.id) ? prev : [...prev, user]))
    setSelectedContact(user)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <Header userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
      <UserSearch users={allUsers} onSelectUser={handleSelectUser} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar contacts={contacts} selectedContact={selectedContact} onSelectContact={setSelectedContact} />
        <ChatWindow key={selectedContact.id} contact={selectedContact} />
      </div>
    </div>
  )
}
