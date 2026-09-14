'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatWindow from '@/components/ChatWindow'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import UserSearch from '@/components/UserSearch'
import CreateGroupModal from '@/components/CreateGroupModal'
import { allUsers } from '@/data/users'
import { initialConversations, getInitialMessages } from '@/data/conversations'
import { findDirectConversation } from '@/lib/conversations'
import { currentUser } from '@/data/currentUser'
import { useDeliveryService, activityActionToStatus } from '@/hooks/useDeliveryService'
import { createClient } from '@/lib/supabase/client'
import { toClientMessage, upsertConversationMessage } from '@/lib/messages'
import { getMyProfile, getPublicProfile, searchUsers, type PublicUserProfile } from '@/lib/userService'
import {
  createConversation,
  createMessage,
  getConversationMessages,
  getConversationParticipantIds,
  listConversations,
  MessageServiceError,
  type ApiConversation,
} from '@/lib/messageService'
import type { Conversation, Message, User } from '@/types'

function buildInitialMessages(): Record<string, Message[]> {
  const map: Record<string, Message[]> = {}
  for (const conv of initialConversations) {
    map[conv.id] = getInitialMessages(conv.id)
  }
  return map
}

export default function Home() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({})
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [fallbackReason, setFallbackReason] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const currentUserIdRef = useRef(currentUserId)
  currentUserIdRef.current = currentUserId
  const { isConnected, lastError, sendTyping, typingByConversation } = useDeliveryService(
    accessToken,
    (delivered) => {
      const incoming = toClientMessage({
        id: delivered.messageId,
        conversationId: delivered.conversationId,
        senderId: delivered.senderId,
        content: delivered.content,
        createdAt: delivered.createdAt,
      })
      setMessagesByConversation((prev) => upsertConversationMessage(prev, incoming))
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === incoming.conversationId
            ? { ...conversation, lastMessageAt: incoming.timestamp }
            : conversation
        )
      )
    },
    {
      snapshot: (frame) => {
        const onlineIds = new Set(frame.users.map((entry) => entry.userId))
        setUsers((previous) =>
          previous.map((user) => ({
            ...user,
            activityStatus:
              user.id === currentUserIdRef.current || onlineIds.has(user.id) ? 'online' : 'offline',
          }))
        )
      },
      changed: (frame) => {
        const status = activityActionToStatus(frame.action)
        setUsers((previous) =>
          previous.map((user) =>
            user.id === frame.userId ? { ...user, activityStatus: status } : user
          )
        )
      },
    }
  )

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  const useDevelopmentFallback = useCallback((reason: string) => {
    setFallbackReason(reason)
    setUsers([currentUser, ...allUsers])
    setCurrentUserId(currentUser.id)
    setConversations(initialConversations)
    setMessagesByConversation(buildInitialMessages())
    setSelectedConversationId(initialConversations[0]?.id ?? '')
    setLoading(false)
  }, [])

  useEffect(() => {
    const load = async () => {
      const configured = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          process.env.NEXT_PUBLIC_USER_SERVICE_URL &&
          process.env.NEXT_PUBLIC_MESSAGE_SERVICE_URL
      )
      if (!configured) {
        if (process.env.NODE_ENV === 'development') {
          useDevelopmentFallback('Development demo data: service configuration is incomplete.')
          return
        }
        throw new Error('Required service configuration is missing.')
      }

      const { data, error } = await createClient().auth.getSession()
      if (error) throw error
      if (!data.session) {
        if (process.env.NODE_ENV === 'development') {
          useDevelopmentFallback('Development demo data: no authenticated session is available.')
          return
        }
        router.replace('/register')
        return
      }

      const token = data.session.access_token
      const me = await getMyProfile(token)
      if (!me) {
        router.replace('/onboarding')
        return
      }

      const apiConversations = await listConversations(token)
      const memberIds = Array.from(
        new Set(apiConversations.flatMap((conversation) => getConversationParticipantIds(conversation)))
      ).filter((id) => id !== me.id)
      const [profiles, histories] = await Promise.all([
        Promise.all(memberIds.map((id) => getPublicProfile(token, id))),
        Promise.all(
          apiConversations.map((conversation) =>
            getConversationMessages(token, conversation.id, { limit: 50 })
          )
        ),
      ])

      const mappedConversations = apiConversations.map(toConversation)
      const messageMap = Object.fromEntries(
        apiConversations.map((conversation, index) => [
          conversation.id,
          histories[index].messages.slice().reverse().map((message) =>
            toClientMessage({
              id: message.id,
              conversationId: message.conversationId,
              senderId: message.senderId,
              content: message.content,
              createdAt: message.createdAt,
            })
          ),
        ])
      )
      const mappedUsers = [toUser(me), ...profiles.filter(isProfile).map(toUser)]
      setAccessToken(token)
      setCurrentUserId(me.id)
      setUsers(mappedUsers)
      setConversations(mappedConversations)
      setMessagesByConversation(messageMap)
      setSelectedConversationId(mappedConversations[0]?.id ?? '')
      setLoading(false)
    }

    load().catch((cause: unknown) => {
      setLoadError(cause instanceof Error ? cause.message : 'Unable to load ChitChat')
      setLoading(false)
    })
  }, [router, useDevelopmentFallback])

  const addKnownUser = (user: User) => {
    setUsers((previous) =>
      previous.some((candidate) => candidate.id === user.id) ? previous : [...previous, user]
    )
  }

  const handleSelectUser = async (user: User) => {
    addKnownUser(user)
    const existing = findDirectConversation(conversations, user.id, currentUserId)
    if (existing) {
      setSelectedConversationId(existing.id)
      return
    }

    try {
      setActionError('')
      const newConversation = accessToken
        ? toConversation(
            await createConversation(accessToken, { isGroup: false, userIds: [user.id] })
          )
        : {
            id: crypto.randomUUID(),
            participantIds: [currentUserId, user.id],
            dateCreated: new Date().toISOString(),
            isGroup: false,
          }
      setConversations((prev) => [...prev, newConversation])
      setMessagesByConversation((prev) => ({ ...prev, [newConversation.id]: [] }))
      setSelectedConversationId(newConversation.id)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Unable to create conversation')
    }
  }

  const handleCreateGroup = async (name: string, memberIds: string[]) => {
    try {
      setActionError('')
      const newConversation = accessToken
        ? toConversation(
            await createConversation(accessToken, { name, isGroup: true, userIds: memberIds })
          )
        : {
            id: crypto.randomUUID(),
            participantIds: [currentUserId, ...memberIds],
            name,
            dateCreated: new Date().toISOString(),
            isGroup: true,
          }
      setConversations((prev) => [...prev, newConversation])
      setMessagesByConversation((prev) => ({ ...prev, [newConversation.id]: [] }))
      setSelectedConversationId(newConversation.id)
      setShowCreateGroup(false)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Unable to create group')
    }
  }

  const handleSearch = useCallback(async (query: string): Promise<User[]> => {
    if (!accessToken) {
      const normalized = query.toLowerCase()
      return allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(normalized) ||
          user.username.toLowerCase().includes(normalized)
      )
    }
    const results = (await searchUsers(accessToken, query)).map(toUser)
    setUsers((previous) => {
      const merged = new Map(previous.map((user) => [user.id, user]))
      results.forEach((user) => merged.set(user.id, user))
      return Array.from(merged.values())
    })
    return results.filter((user) => user.id !== currentUserId)
  }, [accessToken, currentUserId])

  const handleSendMessage = async (content: string) => {
    const messageId = crypto.randomUUID()
    const timestamp = new Date().toISOString()
    const optimisticMessage: Message = {
      id: messageId,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      content,
      timestamp,
      deliveryState: 'pending',
    }

    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] ?? []), optimisticMessage],
    }))

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId ? { ...c, lastMessageAt: timestamp } : c
      )
    )

    try {
      if (!accessToken) {
        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConversationId]: (prev[selectedConversationId] ?? []).map((message) =>
            message.id === messageId ? { ...message, deliveryState: 'sent' } : message
          ),
        }))
        return
      }
      setActionError('')
      const persisted = await createMessage(accessToken, {
        messageId,
        conversationId: selectedConversationId,
        content,
      })
      setMessagesByConversation((prev) => ({
        ...prev,
        [selectedConversationId]: (prev[selectedConversationId] ?? []).map((message) =>
          message.id === messageId
            ? toClientMessage({
                id: persisted.id,
                conversationId: persisted.conversationId,
                senderId: persisted.senderId,
                content: persisted.content,
                createdAt: persisted.createdAt,
              })
            : message
        ),
      }))
    } catch (error: unknown) {
      setMessagesByConversation((prev) => ({
        ...prev,
        [selectedConversationId]: (prev[selectedConversationId] ?? []).map((message) =>
          message.id === messageId ? { ...message, deliveryState: 'failed' } : message
        ),
      }))

      setActionError(
        error instanceof MessageServiceError ? error.message : 'Unable to send message'
      )
      if (error instanceof MessageServiceError) {
        console.error('Message service rejected message:', error.code, error.message)
      }
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-gray-950 grid place-items-center text-gray-400">Loading conversations…</main>
  }
  if (loadError) {
    return <main className="min-h-screen bg-gray-950 grid place-items-center text-red-400">{loadError}</main>
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <Header userAvatar={users.find((user) => user.id === currentUserId)?.profilePic ?? defaultAvatar('User')} />
      {fallbackReason && <p className="bg-amber-950 px-4 py-2 text-xs text-amber-300">{fallbackReason}</p>}
      {actionError && <p className="bg-red-950 px-4 py-2 text-xs text-red-300">{actionError}</p>}
      <UserSearch onSearch={handleSearch} onSelectUser={handleSelectUser} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onCreateGroup={() => setShowCreateGroup(true)}
          currentUserId={currentUserId}
          users={users}
        />
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            messages={messagesByConversation[selectedConversationId] ?? []}
            onSendMessage={handleSendMessage}
            onSendTyping={sendTyping}
            typingUserIds={typingByConversation[selectedConversationId] ?? []}
            isServerConnected={isConnected}
            sendError={lastError}
            currentUserId={currentUserId}
            users={users}
          />
        ) : (
          <main className="flex-1 grid place-items-center text-gray-500">Search for someone to start chatting.</main>
        )}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          users={users.filter((user) => user.id !== currentUserId)}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  )
}

function defaultAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`
}

function toUser(profile: PublicUserProfile): User {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    profilePic: profile.profilePic ?? defaultAvatar(profile.name),
    bio: profile.bio ?? undefined,
    activityStatus: 'offline',
  }
}

function isProfile(profile: PublicUserProfile | null): profile is PublicUserProfile {
  return profile !== null
}

function toConversation(conversation: ApiConversation): Conversation {
  return {
    id: conversation.id,
    participantIds: getConversationParticipantIds(conversation),
    name: conversation.name ?? undefined,
    pic: conversation.picture ?? undefined,
    dateCreated: normalizeTimestamp(conversation.createdAt),
    isGroup: conversation.isGroup,
  }
}

function normalizeTimestamp(value: string | Date): string {
  return typeof value === 'string' ? value : value.toISOString()
}
