export type ActivityStatus = 'online' | 'offline'

export interface User {
  id: string
  name: string
  username: string
  activityStatus: ActivityStatus
  profilePic: string
  email?: string
  bio?: string
}

export interface Conversation {
  id: string
  participantIds: string[]
  name?: string
  pic?: string
  dateCreated: string
  lastMessageAt?: string
  isGroup: boolean
}

export type DeliveryState = 'pending' | 'sent' | 'failed'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  deliveryState?: DeliveryState
}

export interface DisplayMessage extends Message {
  senderName: string
}
