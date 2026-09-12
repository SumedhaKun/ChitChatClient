'use client'

import type { DisplayMessage } from '@/types'
import { CURRENT_USER_ID } from '@/lib/users'

interface MessageBubbleProps {
  message: DisplayMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isOwnMessage = message.senderId === CURRENT_USER_ID

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-100 rounded-bl-none'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
