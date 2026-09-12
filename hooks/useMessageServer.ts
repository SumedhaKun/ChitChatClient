'use client'

import { useCallback, useEffect, useState } from 'react'
import { getMessageServerClient, MessageServerError } from '@/lib/messageServer'

export function useMessageServer() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    const client = getMessageServerClient()

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
      client.disconnect()
      setIsConnected(false)
    }
  }, [])

  const sendMessage = useCallback(async (conversationId: string, content: string, messageId: string) => {
    const client = getMessageServerClient()

    try {
      await client.send({
        type: 'message',
        messageId,
        conversationId,
        content,
      })
      setLastError(null)
      setIsConnected(true)
    } catch (error: unknown) {
      const message =
        error instanceof MessageServerError ? error.message : 'Failed to send message'
      setLastError(message)
      throw error
    }
  }, [])

  return { sendMessage, isConnected, lastError }
}
