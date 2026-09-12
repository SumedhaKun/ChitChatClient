'use client'

import type { Contact } from '@/types'

interface SidebarProps {
  contacts: Contact[]
  selectedContact: Contact
  onSelectContact: (contact: Contact) => void
}

export default function Sidebar({ contacts, selectedContact, onSelectContact }: SidebarProps) {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Contacts</h2>
      </div>
      <ul className="flex-1">
        {contacts.map((contact) => (
          <li key={contact.id}>
            <button
              onClick={() => onSelectContact(contact)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition ${
                selectedContact.id === contact.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
                <p className={`text-xs ${
                  contact.status === 'online' ? 'text-green-600 font-medium' : 'text-gray-500'
                }`}>
                  {contact.status === 'online' ? '● Online' : '○ Offline'}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}