import type { Conversation, Message } from '@/types'
import { CURRENT_USER_ID } from '@/data/currentUser'
import { CONVERSATION_IDS } from '@/data/conversationIds'

export const initialConversations: Conversation[] = [
  {
    id: CONVERSATION_IDS.dmJohn,
    participantIds: [CURRENT_USER_ID, '1'],
    dateCreated: '2024-01-15T10:00:00.000Z',
    lastMessageAt: '2024-03-10T14:30:00.000Z',
    isGroup: false,
  },
  {
    id: CONVERSATION_IDS.dmJane,
    participantIds: [CURRENT_USER_ID, '2'],
    dateCreated: '2024-01-20T10:00:00.000Z',
    lastMessageAt: '2024-03-09T09:15:00.000Z',
    isGroup: false,
  },
  {
    id: CONVERSATION_IDS.dmMike,
    participantIds: [CURRENT_USER_ID, '3'],
    dateCreated: '2024-02-01T10:00:00.000Z',
    lastMessageAt: '2024-03-08T16:45:00.000Z',
    isGroup: false,
  },
  {
    id: CONVERSATION_IDS.dmSarah,
    participantIds: [CURRENT_USER_ID, '4'],
    dateCreated: '2024-02-10T10:00:00.000Z',
    lastMessageAt: '2024-03-07T11:20:00.000Z',
    isGroup: false,
  },
  {
    id: CONVERSATION_IDS.groupDesign,
    participantIds: [CURRENT_USER_ID, '1', '2', '5'],
    name: 'Design Team',
    dateCreated: '2024-02-15T10:00:00.000Z',
    lastMessageAt: '2024-03-10T12:00:00.000Z',
    isGroup: true,
  },
]

export const initialMessagesByConversation: Record<string, Message[]> = {
  [CONVERSATION_IDS.dmJohn]: [
    {
      id: 'b1000001-0000-4000-8000-000000000001',
      conversationId: CONVERSATION_IDS.dmJohn,
      senderId: '1',
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'b1000002-0000-4000-8000-000000000002',
      conversationId: CONVERSATION_IDS.dmJohn,
      senderId: CURRENT_USER_ID,
      content: "I'm doing great! How about you?",
      timestamp: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: 'b1000003-0000-4000-8000-000000000003',
      conversationId: CONVERSATION_IDS.dmJohn,
      senderId: '1',
      content: 'All good! Just working on some projects.',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
    },
  ],
  [CONVERSATION_IDS.dmJane]: [
    {
      id: 'b1000004-0000-4000-8000-000000000004',
      conversationId: CONVERSATION_IDS.dmJane,
      senderId: '2',
      content: 'Did you see the new design specs?',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  [CONVERSATION_IDS.dmMike]: [
    {
      id: 'b1000005-0000-4000-8000-000000000005',
      conversationId: CONVERSATION_IDS.dmMike,
      senderId: '3',
      content: 'API is ready for integration.',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  [CONVERSATION_IDS.dmSarah]: [
    {
      id: 'b1000006-0000-4000-8000-000000000006',
      conversationId: CONVERSATION_IDS.dmSarah,
      senderId: '4',
      content: 'User research notes are uploaded.',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
    },
  ],
  [CONVERSATION_IDS.groupDesign]: [
    {
      id: 'b1000007-0000-4000-8000-000000000007',
      conversationId: CONVERSATION_IDS.groupDesign,
      senderId: '1',
      content: 'Can everyone review the new mockups by EOD?',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'b1000008-0000-4000-8000-000000000008',
      conversationId: CONVERSATION_IDS.groupDesign,
      senderId: '2',
      content: "On it! I'll leave comments in Figma.",
      timestamp: new Date(Date.now() - 6800000).toISOString(),
    },
    {
      id: 'b1000009-0000-4000-8000-000000000009',
      conversationId: CONVERSATION_IDS.groupDesign,
      senderId: '5',
      content: 'Looks great so far. Love the dark mode updates.',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
    },
    {
      id: 'b100000a-0000-4000-8000-00000000000a',
      conversationId: CONVERSATION_IDS.groupDesign,
      senderId: CURRENT_USER_ID,
      content: 'Agreed, the color palette is much cleaner now.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'b100000b-0000-4000-8000-00000000000b',
      conversationId: CONVERSATION_IDS.groupDesign,
      senderId: '1',
      content: "Awesome, let's sync tomorrow morning.",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
}

export function getInitialMessages(conversationId: string): Message[] {
  return initialMessagesByConversation[conversationId] ?? []
}
