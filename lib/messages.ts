import type { DeliveryState, DisplayMessage, Message } from '@/types'
import { resolveSenderName } from '@/lib/users'

export const MAX_MESSAGE_CONTENT_LENGTH = 4_000

export function toDisplayMessage(message: Message): DisplayMessage {
  return {
    ...message,
    senderName: resolveSenderName(message.senderId),
  }
}

export function toDisplayMessages(messages: Message[]): DisplayMessage[] {
  return messages.map(toDisplayMessage)
}

export function toClientMessage(input: {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  deliveryState?: DeliveryState
}): Message {
  return {
    id: input.id,
    conversationId: input.conversationId,
    senderId: input.senderId,
    content: input.content,
    timestamp: input.createdAt,
    deliveryState: input.deliveryState ?? 'sent',
  }
}

export function upsertMessage(messages: Message[], incoming: Message): Message[] {
  const existing = messages.findIndex((message) => message.id === incoming.id)
  if (existing === -1) {
    return [...messages, incoming]
  }
  return messages.map((message, index) =>
    index === existing ? { ...message, ...incoming } : message
  )
}

export function compareMessages(a: Message, b: Message): number {
  const byTime = a.timestamp.localeCompare(b.timestamp)
  if (byTime !== 0) return byTime
  return a.id.localeCompare(b.id)
}

export function getReadReceiptMessageId(
  messages: Message[],
  currentUserId: string,
  otherLastSeenMessageId: string | null
): string | null {
  if (!otherLastSeenMessageId || messages.length === 0) return null

  const sorted = [...messages].sort(compareMessages)
  const seenIndex = sorted.findIndex((message) => message.id === otherLastSeenMessageId)
  if (seenIndex === -1) return null

  for (let index = seenIndex; index >= 0; index -= 1) {
    const message = sorted[index]
    if (message.senderId === currentUserId) {
      return message.id
    }
  }

  return null
}

export function upsertConversationMessage(
  messagesByConversation: Record<string, Message[]>,
  incoming: Message
): Record<string, Message[]> {
  const conversationId = incoming.conversationId
  return {
    ...messagesByConversation,
    [conversationId]: upsertMessage(messagesByConversation[conversationId] ?? [], incoming),
  }
}
