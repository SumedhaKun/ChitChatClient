export interface Contact {
  id: number
  name: string
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