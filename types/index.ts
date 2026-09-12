export interface Contact {
  id: number
  name: string
  username: string
  status: 'online' | 'offline'
  avatar: string
}

export interface Message {
  id: number
  senderId: number | 'user'
  content: string
  timestamp: Date
  senderName: string
}

export interface GroupChat {
  id: number
  name: string
  avatar: string
  members: Contact[]
  isGroup: true
}

export interface Conversation {
  id: number
  name: string
  avatar: string
  status?: 'online' | 'offline'
  members?: Contact[]
  isGroup: boolean
}