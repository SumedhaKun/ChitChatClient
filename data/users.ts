import type { User } from '@/types'

export const allUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    activityStatus: 'online',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    bio: 'Product designer who loves clean UI.',
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    activityStatus: 'offline',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    bio: 'Frontend dev. React enthusiast.',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    username: 'mikej',
    activityStatus: 'online',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    bio: 'Backend engineer. Coffee powered.',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    username: 'sarahw',
    activityStatus: 'offline',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'UX researcher and accessibility advocate.',
  },
  {
    id: '5',
    name: 'Alex Chen',
    username: 'alexchen',
    activityStatus: 'online',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Full-stack developer building cool things.',
  },
  {
    id: '6',
    name: 'Emily Davis',
    username: 'emilyd',
    activityStatus: 'online',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    bio: 'Marketing lead with a passion for storytelling.',
  },
  {
    id: '7',
    name: 'Chris Taylor',
    username: 'christaylor',
    activityStatus: 'offline',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
    bio: 'DevOps engineer. Automating everything.',
  },
  {
    id: '8',
    name: 'Priya Patel',
    username: 'priyap',
    activityStatus: 'online',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    bio: 'Data scientist exploring ML applications.',
  },
]

const userMap = new Map(allUsers.map((u) => [u.id, u]))

export function getUserById(id: string): User | undefined {
  return userMap.get(id)
}

export function getUserByUsername(username: string): User | undefined {
  return allUsers.find((u) => u.username === username)
}
