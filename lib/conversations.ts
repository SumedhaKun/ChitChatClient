import { CURRENT_USER_ID } from '@/data/currentUser'
import type { Conversation } from '@/types'

export function getOtherParticipantId(
  conversation: Conversation,
  currentUserId: string = CURRENT_USER_ID
): string | undefined {
  if (conversation.isGroup) return undefined
  return conversation.participantIds.find((id) => id !== currentUserId)
}

export function findDirectConversation(
  conversations: Conversation[],
  otherUserId: string,
  currentUserId: string = CURRENT_USER_ID
): Conversation | undefined {
  return conversations.find(
    (c) =>
      !c.isGroup &&
      c.participantIds.length === 2 &&
      c.participantIds.includes(otherUserId) &&
      c.participantIds.includes(currentUserId)
  )
}

export function createDirectConversation(otherUserId: string): Conversation {
  return {
    id: crypto.randomUUID(),
    participantIds: [CURRENT_USER_ID, otherUserId],
    dateCreated: new Date().toISOString(),
    isGroup: false,
  }
}

export function createGroupConversation(name: string, memberIds: string[]): Conversation {
  const participantIds = [CURRENT_USER_ID, ...memberIds.filter((id) => id !== CURRENT_USER_ID)]
  return {
    id: crypto.randomUUID(),
    participantIds,
    name,
    dateCreated: new Date().toISOString(),
    isGroup: true,
  }
}

export function getConversationDisplayName(
  conversation: Conversation,
  currentUserId: string = CURRENT_USER_ID,
  getUser: (id: string) => { name: string } | undefined
): string {
  if (conversation.isGroup) return conversation.name ?? 'Group Chat'
  const otherId = getOtherParticipantId(conversation, currentUserId)
  return otherId ? getUser(otherId)?.name ?? 'Unknown' : 'Direct Message'
}
