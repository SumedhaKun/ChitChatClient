'use client'

import React, { useState, useRef, useEffect } from 'react'
import type { Contact, Message } from '@/types'

interface ChatWindowProps {
  contact: Contact
}

export default function ChatWindow({ contact }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: contact.id,
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 3600000),
      senderName: contact.name,
    },
    {
      id: 2,
      senderId: 'user',
      content: 'I\'m doing great! How about you?',
      timestamp: new Date(Date.now() - 3000000),
      senderName: 'You',
    },
    {
      id: 3,
      senderId: contact.id,
      content: 'All good! Just working on some projects.',
      timestamp: new Date(Date.now() - 2400000),
      senderName: contact.name,
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        senderId: 'user',
        content: inputValue,
        timestamp: new Date(),
        senderName: 'You',
      }
      setMessages([...messages, newMessage])
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h2 className="font-semibold text-gray-900">{contact.name}</h2>
          <p className={`text-xs ${
            contact.status === 'online' ? 'text-green-600' : 'text-gray-500'
          }`}>
            {contact.status === 'online' ? '● Online' : '○ Offline'}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-300 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === 'user' ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}