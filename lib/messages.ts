import type { DisplayMessage, Message } from '@/types'
import { resolveSenderName } from '@/lib/users'

export function toDisplayMessage(message: Message): DisplayMessage {
  return {
    ...message,
    senderName: resolveSenderName(message.senderId),
  }
}

export function toDisplayMessages(messages: Message[]): DisplayMessage[] {
  return messages.map(toDisplayMessage)
}
