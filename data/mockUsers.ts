import type { Contact } from '@/types'

export const allUsers: Contact[] = [
  {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    id: 2,
    name: 'Jane Smith',
    username: 'janesmith',
    status: 'offline',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    username: 'mikej',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  },
  {
    id: 4,
    name: 'Sarah Williams',
    username: 'sarahw',
    status: 'offline',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: 5,
    name: 'Alex Chen',
    username: 'alexchen',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  },
  {
    id: 6,
    name: 'Emily Davis',
    username: 'emilyd',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  },
  {
    id: 7,
    name: 'Chris Taylor',
    username: 'christaylor',
    status: 'offline',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
  },
  {
    id: 8,
    name: 'Priya Patel',
    username: 'priyap',
    status: 'online',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  },
]

export const initialContacts = allUsers.slice(0, 4)
