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
