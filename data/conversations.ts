import type { Conversation, Message } from '@/types'
import { CURRENT_USER_ID } from '@/data/currentUser'

export const initialConversations: Conversation[] = [
  {
    id: 'conv-dm-1',
    participantIds: [CURRENT_USER_ID, '1'],
    dateCreated: '2024-01-15T10:00:00.000Z',
    lastMessageAt: '2024-03-10T14:30:00.000Z',
    isGroup: false,
  },
  {
    id: 'conv-dm-2',
    participantIds: [CURRENT_USER_ID, '2'],
    dateCreated: '2024-01-20T10:00:00.000Z',
    lastMessageAt: '2024-03-09T09:15:00.000Z',
    isGroup: false,
  },
  {
    id: 'conv-dm-3',
    participantIds: [CURRENT_USER_ID, '3'],
    dateCreated: '2024-02-01T10:00:00.000Z',
    lastMessageAt: '2024-03-08T16:45:00.000Z',
    isGroup: false,
  },
  {
    id: 'conv-dm-4',
    participantIds: [CURRENT_USER_ID, '4'],
    dateCreated: '2024-02-10T10:00:00.000Z',
    lastMessageAt: '2024-03-07T11:20:00.000Z',
    isGroup: false,
  },
  {
    id: 'conv-group-design',
    participantIds: [CURRENT_USER_ID, '1', '2', '5'],
    name: 'Design Team',
    dateCreated: '2024-02-15T10:00:00.000Z',
    lastMessageAt: '2024-03-10T12:00:00.000Z',
    isGroup: true,
  },
]

export const initialMessagesByConversation: Record<string, Message[]> = {
  'conv-dm-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-dm-1',
      senderId: '1',
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-dm-1',
      senderId: CURRENT_USER_ID,
      content: "I'm doing great! How about you?",
      timestamp: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-dm-1',
      senderId: '1',
      content: 'All good! Just working on some projects.',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
    },
  ],
  'conv-dm-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-dm-2',
      senderId: '2',
      content: 'Did you see the new design specs?',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  'conv-dm-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-dm-3',
      senderId: '3',
      content: 'API is ready for integration.',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  'conv-dm-4': [
    {
      id: 'msg-4-1',
      conversationId: 'conv-dm-4',
      senderId: '4',
      content: 'User research notes are uploaded.',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
    },
  ],
  'conv-group-design': [
    {
      id: 'msg-g-1',
      conversationId: 'conv-group-design',
      senderId: '1',
      content: 'Can everyone review the new mockups by EOD?',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'msg-g-2',
      conversationId: 'conv-group-design',
      senderId: '2',
      content: "On it! I'll leave comments in Figma.",
      timestamp: new Date(Date.now() - 6800000).toISOString(),
    },
    {
      id: 'msg-g-3',
      conversationId: 'conv-group-design',
      senderId: '5',
      content: 'Looks great so far. Love the dark mode updates.',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
    },
    {
      id: 'msg-g-4',
      conversationId: 'conv-group-design',
      senderId: CURRENT_USER_ID,
      content: 'Agreed, the color palette is much cleaner now.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg-g-5',
      conversationId: 'conv-group-design',
      senderId: '1',
      content: "Awesome, let's sync tomorrow morning.",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
}

export function getInitialMessages(conversationId: string): Message[] {
  return initialMessagesByConversation[conversationId] ?? []
}
