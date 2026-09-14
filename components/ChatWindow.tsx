'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { Conversation, Message, User } from '@/types'
import { getConversationDisplayName, getOtherParticipantId } from '@/lib/conversations'
import { getReadReceiptMessageId, MAX_MESSAGE_CONTENT_LENGTH } from '@/lib/messages'
import { useOutgoingTyping } from '@/hooks/useOutgoingTyping'

interface ChatWindowProps {
  conversation: Conversation
  messages: Message[]
  otherLastSeenMessageId?: string | null
  onSendMessage: (content: string) => void | Promise<void>
  onSendTyping: (conversationId: string, isTyping: boolean) => void
  typingUserIds?: string[]
  isServerConnected?: boolean
  sendError?: string | null
  currentUserId: string
  users: User[]
}

function UsernameLink({
  senderId,
  senderName,
  currentUserId,
  user,
}: {
  senderId: string
  senderName: string
  currentUserId: string
  user?: User
}) {
  if (senderId === currentUserId) {
    return <span className="text-xs font-medium text-blue-300">{senderName}</span>
  }

  if (!user) {
    return <span className="text-xs font-medium text-gray-300">{senderName}</span>
  }

  return (
    <Link
      href={`/contact/${user.id}`}
      className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline"
    >
      {senderName}
    </Link>
  )
}

export default function ChatWindow({
  conversation,
  messages,
  otherLastSeenMessageId = null,
  onSendMessage,
  onSendTyping,
  typingUserIds = [],
  isServerConnected = false,
  sendError = null,
  currentUserId,
  users,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const setTyping = useOutgoingTyping(conversation.id, onSendTyping)
  const resolveUser = (id: string) => users.find((user) => user.id === id)
  const displayMessages = messages.map((message) => ({
    ...message,
    senderName: message.senderId === currentUserId ? 'You' : resolveUser(message.senderId)?.name ?? 'Unknown',
  }))

  const isGroup = conversation.isGroup
  const otherId = getOtherParticipantId(conversation, currentUserId)
  const otherUser = otherId ? resolveUser(otherId) : undefined
  const displayName = getConversationDisplayName(conversation, currentUserId, resolveUser)
  const typingNames = typingUserIds
    .filter((userId) => userId !== currentUserId)
    .map((userId) => resolveUser(userId)?.name ?? 'Someone')
  const readReceiptMessageId =
    !isGroup && otherLastSeenMessageId
      ? getReadReceiptMessageId(messages, currentUserId, otherLastSeenMessageId)
      : null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingNames.length])

  const trimmedInput = inputValue.trim()
  const isOverLimit = inputValue.length > MAX_MESSAGE_CONTENT_LENGTH
  const canSend = trimmedInput.length > 0 && !isOverLimit

  const handleSendMessage = () => {
    if (canSend) {
      setTyping(false)
      onSendMessage(trimmedInput)
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
                  href={`/contact/${otherUser.id}`}
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
                    href={`/contact/${otherUser.id}`}
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
          const isOwnMessage = message.senderId === currentUserId

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
            >
              {!isOwnMessage && (
                <div className="mb-1 ml-1">
                  <UsernameLink
                    senderId={message.senderId}
                    senderName={message.senderName}
                    currentUserId={currentUserId}
                    user={resolveUser(message.senderId)}
                  />
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
                  {isOwnMessage && (
                    <span className="ml-2">
                      {message.deliveryState === 'pending'
                        ? 'Sending…'
                        : message.deliveryState === 'failed'
                          ? 'Failed'
                          : message.id === readReceiptMessageId
                            ? 'Read'
                            : 'Sent'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
        {typingNames.length > 0 && (
          <p className="text-xs text-gray-400 italic px-1">
            {typingNames.length === 1
              ? `${typingNames[0]} is typing…`
              : `${typingNames.join(', ')} are typing…`}
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className={isServerConnected ? 'text-green-400' : 'text-gray-500'}>
            {isServerConnected ? '● Connected to delivery service' : '○ Delivery service offline'}
          </span>
          {sendError && <span className="text-red-400">{sendError}</span>}
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => {
                const nextValue = e.target.value
                setInputValue(nextValue)
                setTyping(nextValue.trim().length > 0)
              }}
              onBlur={() => setTyping(false)}
              onKeyDown={handleKeyDown}
              maxLength={MAX_MESSAGE_CONTENT_LENGTH}
              placeholder={isGroup ? `Message ${displayName}...` : 'Type a message...'}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
            <p className={`text-xs mt-1 text-right ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
              {inputValue.length}/{MAX_MESSAGE_CONTENT_LENGTH}
            </p>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!canSend}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
