'use client'

import { useState } from 'react'
import ChatWindow from '@/components/ChatWindow'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import UserSearch from '@/components/UserSearch'
import CreateGroupModal from '@/components/CreateGroupModal'
import { allUsers } from '@/data/users'
import { initialConversations, getInitialMessages } from '@/data/conversations'
import {
  createDirectConversation,
  createGroupConversation,
  findDirectConversation,
} from '@/lib/conversations'
import { CURRENT_USER_ID } from '@/lib/users'
import { useMessageServer } from '@/hooks/useMessageServer'
import { MessageServerError } from '@/lib/messageServer'
import type { Conversation, Message, User } from '@/types'

function buildInitialMessages(): Record<string, Message[]> {
  const map: Record<string, Message[]> = {}
  for (const conv of initialConversations) {
    map[conv.id] = getInitialMessages(conv.id)
  }
  return map
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>(
    buildInitialMessages
  )
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversations[0].id)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const { sendMessage: sendToServer, isConnected, lastError } = useMessageServer()

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  const handleSelectUser = (user: User) => {
    const existing = findDirectConversation(conversations, user.id)
    if (existing) {
      setSelectedConversationId(existing.id)
      return
    }

    const newConversation = createDirectConversation(user.id)
    setConversations((prev) => [...prev, newConversation])
    setMessagesByConversation((prev) => ({ ...prev, [newConversation.id]: [] }))
    setSelectedConversationId(newConversation.id)
  }

  const handleCreateGroup = (name: string, memberIds: string[]) => {
    const newConversation = createGroupConversation(name, memberIds)
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: newConversation.id,
      senderId: CURRENT_USER_ID,
      content: 'Group chat created!',
      timestamp: new Date().toISOString(),
    }

    setConversations((prev) => [...prev, newConversation])
    setMessagesByConversation((prev) => ({
      ...prev,
      [newConversation.id]: [welcomeMessage],
    }))
    setSelectedConversationId(newConversation.id)
    setShowCreateGroup(false)
  }

  const handleSendMessage = async (content: string) => {
    const messageId = crypto.randomUUID()
    const timestamp = new Date().toISOString()
    const optimisticMessage: Message = {
      id: messageId,
      conversationId: selectedConversationId,
      senderId: CURRENT_USER_ID,
      content,
      timestamp,
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
      await sendToServer(selectedConversationId, content, messageId)
    } catch (error: unknown) {
      setMessagesByConversation((prev) => ({
        ...prev,
        [selectedConversationId]: (prev[selectedConversationId] ?? []).filter(
          (message) => message.id !== messageId
        ),
      }))

      if (error instanceof MessageServerError) {
        console.error('Message server rejected message:', error.code, error.message)
      }
    }
  }

  if (!selectedConversation) return null

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <Header userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
      <UserSearch users={allUsers} onSelectUser={handleSelectUser} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onCreateGroup={() => setShowCreateGroup(true)}
        />
        <ChatWindow
          conversation={selectedConversation}
          messages={messagesByConversation[selectedConversationId] ?? []}
          onSendMessage={handleSendMessage}
          isServerConnected={isConnected}
          sendError={lastError}
        />
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          users={allUsers}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  )
}
