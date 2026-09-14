import { refreshIfAuthError } from '@/lib/authErrors'

const MESSAGE_SERVICE_URL =
  process.env.NEXT_PUBLIC_MESSAGE_SERVICE_URL ?? 'http://localhost:8080'

export type ConversationMember = {
  userId: string
  conversationId: string
  joinedAt: string
  lastSeenMessage: string | null
}

export type ApiConversation = {
  id: string
  name: string | null
  picture: string | null
  createdAt: string
  isGroup: boolean
  memberIds?: string[]
  members?: ConversationMember[]
}

export function getConversationParticipantIds(conversation: ApiConversation): string[] {
  if (conversation.members?.length) {
    return conversation.members.map((member) => member.userId)
  }
  return conversation.memberIds ?? []
}

export function getMemberLastSeenMessageId(
  conversation: ApiConversation,
  userId: string
): string | null {
  const member = conversation.members?.find((entry) => entry.userId === userId)
  return member?.lastSeenMessage ?? null
}

export type ApiMessage = {
  id: string
  senderId: string
  conversationId: string
  content: string
  createdAt: string
}

export type MessageHistory = {
  messages: ApiMessage[]
  nextCursor: string | null
}

type ErrorBody = {
  error?: {
    code?: string
    message?: string
    details?: Array<{ field: string; message: string }>
  }
  message?: string
}

export class MessageServiceError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly details?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'MessageServiceError'
  }
}

async function request<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${MESSAGE_SERVICE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody
    const error = new MessageServiceError(
      body.error?.message ?? body.message ?? `Message service request failed (${response.status})`,
      body.error?.code ?? `HTTP_${response.status}`,
      body.error?.details
    )
    refreshIfAuthError(error)
    throw error
  }

  return response.json() as Promise<T>
}

export async function createMessage(
  accessToken: string,
  input: { messageId: string; conversationId: string; content: string }
): Promise<ApiMessage> {
  const { message } = await request<{ message: ApiMessage }>('/message', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      message_id: input.messageId,
      conversation_id: input.conversationId,
      content: input.content,
    }),
  })
  return message
}

export async function listConversations(accessToken: string): Promise<ApiConversation[]> {
  const { conversations } = await request<{ conversations: ApiConversation[] }>(
    '/conversations',
    accessToken
  )
  return conversations
}

export async function createConversation(
  accessToken: string,
  input: {
    name?: string
    picture?: string
    isGroup: boolean
    userIds: string[]
  }
): Promise<ApiConversation> {
  const { conversation } = await request<{ conversation: ApiConversation }>(
    '/conversation',
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        ...(input.name ? { name: input.name } : {}),
        ...(input.picture ? { picture: input.picture } : {}),
        is_group: input.isGroup,
        user_ids: input.userIds,
      }),
    }
  )
  return conversation
}

export async function getOtherParticipantLastSeen(
  accessToken: string,
  conversationId: string
): Promise<string | null> {
  const { last_seen_message } = await request<{ last_seen_message: string | null }>(
    `/conversation/${encodeURIComponent(conversationId)}/other-last-seen`,
    accessToken
  )
  return last_seen_message
}

export async function markConversationSeen(
  accessToken: string,
  conversationId: string,
  messageId: string
): Promise<ConversationMember> {
  const { member } = await request<{ member: ConversationMember }>(
    `/conversation/${encodeURIComponent(conversationId)}/last-seen`,
    accessToken,
    {
      method: 'PUT',
      body: JSON.stringify({ message_id: messageId }),
    }
  )
  return member
}

export async function getConversationMessages(
  accessToken: string,
  conversationId: string,
  options: { limit?: number; cursor?: string } = {}
): Promise<MessageHistory> {
  const params = new URLSearchParams()
  if (options.limit) params.set('limit', String(options.limit))
  if (options.cursor) params.set('cursor', options.cursor)

  const suffix = params.size ? `?${params}` : ''
  const result = await request<{
    messages: ApiMessage[]
    next_cursor?: string | null
  }>(
    `/conversation/${encodeURIComponent(conversationId)}/messages${suffix}`,
    accessToken
  )

  return {
    messages: result.messages,
    nextCursor: result.next_cursor ?? null,
  }
}
