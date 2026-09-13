const USER_SERVICE_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? 'http://localhost:8081'

export type PublicUserProfile = {
  id: string
  username: string
  name: string
  profilePic: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

export type UserProfile = PublicUserProfile & {
  email: string
}

export type UpdateMyProfileInput = {
  username?: string
  name?: string
  profilePic?: string | null
  bio?: string | null
}

type ApiError = {
  error?: { message?: string }
  message?: string
}

export class UserServiceError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'UserServiceError'
  }
}

async function request<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${USER_SERVICE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError
    throw new UserServiceError(
      body.error?.message ?? body.message ?? `Request failed (${response.status})`,
      response.status
    )
  }

  return response.json() as Promise<T>
}

export async function getMyProfile(accessToken: string): Promise<UserProfile | null> {
  try {
    const { user } = await request<{ user: UserProfile }>('/users/me', accessToken)
    return user
  } catch (error) {
    if (
      error instanceof UserServiceError &&
      (error.status === 404 || error.message === 'User profile not found')
    ) {
      return null
    }
    throw error
  }
}

export async function createMyProfile(
  accessToken: string,
  input: { username: string; name: string; profile_pic?: string }
): Promise<UserProfile> {
  const { user } = await request<{ user: UserProfile }>('/users', accessToken, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return user
}

export async function updateMyProfile(
  accessToken: string,
  input: UpdateMyProfileInput
): Promise<UserProfile> {
  const body: Record<string, unknown> = {}
  if (input.username !== undefined) body.username = input.username
  if (input.name !== undefined) body.name = input.name
  if (input.bio !== undefined) body.bio = input.bio
  if (input.profilePic !== undefined) body.profile_pic = input.profilePic

  const { user } = await request<{ user: UserProfile }>('/users/me', accessToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return user
}

export async function searchUsers(
  accessToken: string,
  query: string,
  limit = 20
): Promise<PublicUserProfile[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(Math.max(1, Math.min(limit, 100))),
  })
  const { users } = await request<{ users: PublicUserProfile[] }>(
    `/users/search?${params}`,
    accessToken
  )
  return users
}

export async function getPublicProfile(
  accessToken: string,
  userId: string
): Promise<PublicUserProfile | null> {
  try {
    const { user } = await request<{ user: PublicUserProfile }>(
      `/users/${encodeURIComponent(userId)}`,
      accessToken
    )
    return user
  } catch (error) {
    if (error instanceof UserServiceError && error.status === 404) return null
    throw error
  }
}
