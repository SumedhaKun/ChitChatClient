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
}

export interface ServerErrorResponse {
  type: 'error'
  code: string
  message: string
  messageId?: string
  details?: Array<{ field: string; message: string }>
}

export type MessageServerResponse = MessageAck | ServerErrorResponse
