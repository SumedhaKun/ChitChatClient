import type { User } from '@/types'

export const CURRENT_USER_ID = 'me'

export const currentUser: User = {
  id: CURRENT_USER_ID,
  name: 'You',
  username: 'user123',
  activityStatus: 'online',
  profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  email: 'user@example.com',
  bio: 'ChitChat power user.',
}
