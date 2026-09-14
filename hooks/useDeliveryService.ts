'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { DeliveryServiceError, getDeliveryClient } from '@/lib/deliveryService'
import type { ActivityStatus } from '@/types'
import type {
  ActivityChangedFrame,
  ActivitySnapshotFrame,
  DeliveredMessagePayload,
} from '@/types/deliveryService'

export function activityActionToStatus(
  action: ActivityChangedFrame['action']
): ActivityStatus {
  return action === 'set' ? 'online' : 'offline'
}

export function useDeliveryService(
  accessToken: string | null,
  onMessage?: (message: DeliveredMessagePayload) => void,
  onActivity?: {
    snapshot?: (frame: ActivitySnapshotFrame) => void
    changed?: (frame: ActivityChangedFrame) => void
  }
) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [typingByConversation, setTypingByConversation] = useState<Record<string, string[]>>({})
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage
  const onActivityRef = useRef(onActivity)
  onActivityRef.current = onActivity

  useEffect(() => {
    if (!accessToken) {
      setIsConnected(false)
      setTypingByConversation({})
      return
    }

    const client = getDeliveryClient(accessToken)
    const unsubscribeStatus = client.subscribeStatus((connected, error) => {
      setIsConnected(connected)
      setLastError(error ?? null)
      if (!connected) setTypingByConversation({})
    })
    const unsubscribeMessages = client.subscribeMessages((message) => {
      onMessageRef.current?.(message)
    })
    const unsubscribeTyping = client.subscribeTyping((frame) => {
      setTypingByConversation((previous) => {
        const current = new Set(previous[frame.conversationId] ?? [])
        if (frame.isTyping) current.add(frame.userId)
        else current.delete(frame.userId)
        return { ...previous, [frame.conversationId]: [...current] }
      })
    })
    const unsubscribeActivityChanged = client.subscribeActivityChanged((frame) => {
      onActivityRef.current?.changed?.(frame)
    })
    const unsubscribeActivitySnapshot = client.subscribeActivitySnapshot((frame) => {
      onActivityRef.current?.snapshot?.(frame)
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
          error instanceof DeliveryServiceError
            ? error.message
            : 'Failed to connect to delivery service'
        )
      })

    return () => {
      unsubscribeStatus()
      unsubscribeMessages()
      unsubscribeTyping()
      unsubscribeActivityChanged()
      unsubscribeActivitySnapshot()
      client.disconnect()
      setIsConnected(false)
      setTypingByConversation({})
    }
  }, [accessToken])

  const sendTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (!accessToken) return
      getDeliveryClient(accessToken).sendTyping(conversationId, isTyping)
    },
    [accessToken]
  )

  return { isConnected, lastError, sendTyping, typingByConversation }
}
