export interface AuthRequest {
  type: 'auth'
  accessToken: string
}

export interface ActivityRequest {
  type: 'activity'
  action: 'set' | 'delete'
}

export interface TypingRequest {
  type: 'typing'
  conversationId: string
  isTyping: boolean
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

export interface ActivityChangedFrame {
  type: 'activity_changed'
  userId: string
  action: 'set' | 'delete' | 'timeout'
}

export interface ActivitySnapshotEntry {
  userId: string
  action: 'set'
}

export interface ActivitySnapshotFrame {
  type: 'activity_snapshot'
  users: ActivitySnapshotEntry[]
}

export interface TypingFrame {
  type: 'typing'
  userId: string
  conversationId: string
  isTyping: boolean
}

export interface ServerErrorResponse {
  type: 'error'
  code: string
  message: string
}

export type DeliveryServiceResponse =
  | AuthAck
  | MessageCreatedFrame
  | ActivityChangedFrame
  | ActivitySnapshotFrame
  | TypingFrame
  | ServerErrorResponse
