import type { DisplayMessage, Message } from '@/types'
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
