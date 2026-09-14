'use client'

import type { Conversation, Message, User } from '@/types'
import {
  formatLastMessageSnippet,
  getConversationDisplayName,
  getOtherParticipantId,
  sortConversationsByRecent,
} from '@/lib/conversations'
import { countUnreadMessages, isConversationUnread } from '@/lib/messages'

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  const label = count > 99 ? '99+' : String(count)
  return (
    <span
      className="shrink-0 min-w-5 h-5 px-1 rounded-full bg-blue-500 text-[11px] font-semibold leading-none text-white inline-flex items-center justify-center"
      aria-label={`${count} unread messages`}
    >
      {label}
    </span>
  )
}

interface SidebarProps {
  conversations: Conversation[]
  messagesByConversation: Record<string, Message[]>
  myLastSeenByConversation: Record<string, string | null>
  selectedConversationId: string
  onSelectConversation: (id: string) => void
  onCreateGroup: () => void
  currentUserId: string
  users: User[]
}

export default function Sidebar({
  conversations,
  messagesByConversation,
  myLastSeenByConversation,
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
  const unreadOptions = (conversationId: string) => ({
    treatAsRead: conversationId === selectedConversationId,
  })
  const unreadCountFor = (conversationId: string) =>
    countUnreadMessages(
      messagesByConversation[conversationId],
      myLastSeenByConversation[conversationId],
      currentUserId,
      unreadOptions(conversationId)
    )
  const snippetClassName = (conversationId: string) => {
    const unread = isConversationUnread(
      messagesByConversation[conversationId],
      myLastSeenByConversation[conversationId],
      currentUserId,
      unreadOptions(conversationId)
    )
    return unread
      ? 'text-xs truncate font-semibold text-gray-200'
      : 'text-xs truncate text-gray-500'
  }
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
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="text-sm font-medium text-gray-100 truncate">
                        {getConversationDisplayName(conversation, currentUserId, resolveUser)}
                      </h3>
                      <p className={snippetClassName(conversation.id)}>
                        {snippetFor(conversation.id) ??
                          `${conversation.participantIds.length} members`}
                      </p>
                    </div>
                    <UnreadBadge count={unreadCountFor(conversation.id)} />
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
                  <div className="flex-1 min-w-0 flex items-center gap-2">
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
                      <p className={snippetClassName(conversation.id)}>
                        {snippetFor(conversation.id) ??
                          (otherUser ? `@${otherUser.username}` : 'No messages yet')}
                      </p>
                    </div>
                    <UnreadBadge count={unreadCountFor(conversation.id)} />
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
