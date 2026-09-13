'use client'

import { useCallback, useEffect, useState } from 'react'
import { getMessageServerClient, MessageServerError } from '@/lib/messageServer'

export function useMessageServer(accessToken: string | null) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setIsConnected(false)
      return
    }
    const client = getMessageServerClient(accessToken)
    const unsubscribe = client.subscribe((connected, error) => {
      setIsConnected(connected)
      setLastError(error ?? null)
    })

    client
      .connect()
      .then(() => {
        setIsConnected(true)
        setLastError(null)
      })
      .catch((error: unknown) => {
        setIsConnected(false)
        setLastError(
          error instanceof MessageServerError ? error.message : 'Failed to connect to message server'
        )
      })

    return () => {
      unsubscribe()
      client.disconnect()
      setIsConnected(false)
    }
  }, [accessToken])

  const sendMessage = useCallback(async (conversationId: string, content: string, messageId: string) => {
    if (!accessToken) {
      throw new MessageServerError('Sign in to send messages', 'AUTH_REQUIRED')
    }
    const client = getMessageServerClient(accessToken)

    try {
      const ack = await client.send({
        type: 'message',
        messageId,
        conversationId,
        content,
      })
      setLastError(null)
      setIsConnected(true)
      return ack
    } catch (error: unknown) {
      const message =
        error instanceof MessageServerError ? error.message : 'Failed to send message'
      setLastError(message)
      throw error
    }
  }, [accessToken])

  return { sendMessage, isConnected, lastError }
}
