export interface AuthRequest {
  type: 'auth'
  accessToken: string
}

export interface AuthAck {
  type: 'auth_ack'
}

export interface DeliveredMessagePayload {
  messageId: string
  senderId: string
  conversationId: string
  content: string
  createdAt: string
}

export interface MessageCreatedFrame {
  type: 'message_created'
  message: DeliveredMessagePayload
}

export interface ServerErrorResponse {
  type: 'error'
  code: string
  message: string
}

export type DeliveryServiceResponse = AuthAck | MessageCreatedFrame | ServerErrorResponse
