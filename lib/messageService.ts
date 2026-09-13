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
  error?: { message?: string }
  message?: string
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
    throw new Error(
      body.error?.message ?? body.message ?? `Message service request failed (${response.status})`
    )
  }

  return response.json() as Promise<T>
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
