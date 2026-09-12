'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { Conversation, Message } from '@/types'
import { CURRENT_USER_ID, resolveUser } from '@/lib/users'
import { getConversationDisplayName, getOtherParticipantId } from '@/lib/conversations'
import { toDisplayMessages } from '@/lib/messages'

interface ChatWindowProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (content: string) => void
}

function UsernameLink({ senderId, senderName }: { senderId: string; senderName: string }) {
  if (senderId === CURRENT_USER_ID) {
    return <span className="text-xs font-medium text-blue-300">{senderName}</span>
  }

  const user = resolveUser(senderId)
  if (!user) {
    return <span className="text-xs font-medium text-gray-300">{senderName}</span>
  }

  return (
    <Link
      href={`/contact/${user.username}`}
      className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline"
    >
      {senderName}
    </Link>
  )
}

export default function ChatWindow({ conversation, messages, onSendMessage }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const displayMessages = toDisplayMessages(messages)

  const isGroup = conversation.isGroup
  const otherId = getOtherParticipantId(conversation)
  const otherUser = otherId ? resolveUser(otherId) : undefined
  const displayName = getConversationDisplayName(conversation, CURRENT_USER_ID, resolveUser)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center gap-3">
        {isGroup ? (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-100">{displayName}</h2>
              <p className="text-xs text-gray-500">{conversation.participantIds.length} members</p>
            </div>
          </>
        ) : (
          <>
            <img
              src={otherUser?.profilePic}
              alt={otherUser?.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div>
              {otherUser ? (
                <Link
                  href={`/contact/${otherUser.username}`}
                  className="font-semibold text-gray-100 hover:text-blue-400 hover:underline"
                >
                  {otherUser.name}
                </Link>
              ) : (
                <h2 className="font-semibold text-gray-100">{displayName}</h2>
              )}
              {otherUser && (
                <p className="text-xs">
                  <Link
                    href={`/contact/${otherUser.username}`}
                    className="text-gray-400 hover:text-blue-400 hover:underline"
                  >
                    @{otherUser.username}
                  </Link>
                  <span className="mx-1.5 text-gray-600">·</span>
                  <span className={otherUser.activityStatus === 'online' ? 'text-green-400' : 'text-gray-500'}>
                    {otherUser.activityStatus === 'online' ? 'Online' : 'Offline'}
                  </span>
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.map((message) => {
          const isOwnMessage = message.senderId === CURRENT_USER_ID

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
            >
              {!isOwnMessage && (
                <div className="mb-1 ml-1">
                  <UsernameLink senderId={message.senderId} senderName={message.senderName} />
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGroup ? `Message ${displayName}...` : 'Type a message...'}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
