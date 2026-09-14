import { DeliveryServiceError } from '@/lib/deliveryService'
import { MessageServiceError } from '@/lib/messageService'
import { UserServiceError } from '@/lib/userService'

export function isAuthError(error: unknown): boolean {
  if (error instanceof MessageServiceError) {
    return (
      error.code === 'HTTP_401' ||
      error.code === 'HTTP_403' ||
      /AUTH/i.test(error.code)
    )
  }
  if (error instanceof UserServiceError) {
    return error.status === 401 || error.status === 403
  }
  if (error instanceof DeliveryServiceError) {
    return /AUTH/i.test(error.code)
  }
  return false
}

export function refreshIfAuthError(error: unknown): void {
  if (typeof window === 'undefined') return
  if (isAuthError(error)) {
    window.location.reload()
  }
}

export function isAuthStatusMessage(message: string): boolean {
  return /auth|token|unauthorized|forbidden/i.test(message)
}
