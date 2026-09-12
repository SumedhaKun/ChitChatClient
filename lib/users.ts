import { currentUser, CURRENT_USER_ID } from '@/data/currentUser'
import { allUsers, getUserById } from '@/data/users'
import type { User } from '@/types'

export { CURRENT_USER_ID, currentUser, getUserById, allUsers }

export function resolveUser(id: string): User | undefined {
  if (id === CURRENT_USER_ID) return currentUser
  return getUserById(id)
}

export function resolveSenderName(senderId: string): string {
  if (senderId === CURRENT_USER_ID) return 'You'
  return resolveUser(senderId)?.name ?? 'Unknown'
}
