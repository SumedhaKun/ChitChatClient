'use client'

import type { Conversation, Message, User } from '@/types'
import {
  formatLastMessageSnippet,
  getConversationDisplayName,
  getOtherParticipantId,
  sortConversationsByRecent,
} from '@/lib/conversations'

interface SidebarProps {
  conversations: Conversation[]
  messagesByConversation: Record<string, Message[]>
  selectedConversationId: string
  onSelectConversation: (id: string) => void
  onCreateGroup: () => void
  currentUserId: string
  users: User[]
}

export default function Sidebar({
  conversations,
  messagesByConversation,
  selectedConversationId,
  onSelectConversation,
  onCreateGroup,
  currentUserId,
  users,
}: SidebarProps) {
  const resolveUser = (id: string) => users.find((user) => user.id === id)
  const resolveSenderName = (senderId: string) => resolveUser(senderId)?.name
  const snippetFor = (conversationId: string) =>
    formatLastMessageSnippet(
      messagesByConversation[conversationId]?.at(-1),
      currentUserId,
      resolveSenderName
    )
  const groupConversations = sortConversationsByRecent(conversations.filter((c) => c.isGroup))
  const directConversations = sortConversationsByRecent(conversations.filter((c) => !c.isGroup))

  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Chats</h2>
        <button
          type="button"
          onClick={onCreateGroup}
          title="Create group chat"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {groupConversations.length > 0 && (
        <div className="border-b border-gray-800">
          <p className="px-4 pt-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">Groups</p>
          <ul>
            {groupConversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition ${
                    selectedConversationId === conversation.id
                      ? 'bg-gray-800 border-l-4 border-blue-500'
                      : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="text-sm font-medium text-gray-100 truncate">
                      {getConversationDisplayName(conversation, currentUserId, resolveUser)}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {snippetFor(conversation.id) ??
                        `${conversation.participantIds.length} members`}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1">
        <p className="px-4 pt-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">Direct Messages</p>
        <ul>
          {directConversations.map((conversation) => {
            const otherId = getOtherParticipantId(conversation, currentUserId)
            const otherUser = otherId ? resolveUser(otherId) : undefined

            return (
              <li key={conversation.id}>
                <button
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition ${
                    selectedConversationId === conversation.id
                      ? 'bg-gray-800 border-l-4 border-blue-500'
                      : ''
                  }`}
                >
                  {otherUser ? (
                    <img
                      src={otherUser.profilePic}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 shrink-0" />
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-sm font-medium text-gray-100 truncate">
                        {otherUser?.name ?? 'Unknown'}
                      </h3>
                      {otherUser?.activityStatus === 'online' && (
                        <span className="shrink-0 text-[10px] text-green-400" title="Online">
                          ●
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {snippetFor(conversation.id) ??
                        (otherUser ? `@${otherUser.username}` : 'No messages yet')}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
