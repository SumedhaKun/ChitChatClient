'use client'

import { useEffect, useRef, useState } from 'react'
import { DeliveryServiceError, getDeliveryClient } from '@/lib/deliveryService'
import type { DeliveredMessagePayload } from '@/types/deliveryService'

export function useDeliveryService(
  accessToken: string | null,
  onMessage?: (message: DeliveredMessagePayload) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!accessToken) {
      setIsConnected(false)
      return
    }

    const client = getDeliveryClient(accessToken)
    const unsubscribeStatus = client.subscribeStatus((connected, error) => {
      setIsConnected(connected)
      setLastError(error ?? null)
    })
    const unsubscribeMessages = client.subscribeMessages((message) => {
      onMessageRef.current?.(message)
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
      client.disconnect()
      setIsConnected(false)
    }
  }, [accessToken])

  return { isConnected, lastError }
}
