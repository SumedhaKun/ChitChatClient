export interface OutgoingMessagePayload {
  type: 'message'
  messageId: string
  conversationId: string
  content: string
}

export interface MessageAck {
  type: 'ack'
  messageId: string
  status: 'accepted'
  message: {
    id: string
    senderId: string
    conversationId: string
    content: string
    createdAt: string
  }
}

export interface AuthRequest {
  type: 'auth'
  accessToken: string
}

export interface AuthAck {
  type: 'auth_ack'
}

export interface ServerErrorResponse {
  type: 'error'
  code: string
  message: string
  messageId?: string
  details?: Array<{ field: string; message: string }>
}

export type MessageServerResponse = AuthAck | MessageAck | ServerErrorResponse
