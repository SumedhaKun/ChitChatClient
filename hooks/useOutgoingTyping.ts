'use client'

import { useCallback, useEffect, useRef } from 'react'

const TYPING_REFRESH_MS = 2_000

export function useOutgoingTyping(
  conversationId: string,
  sendTyping: (conversationId: string, isTyping: boolean) => void
) {
  const isTypingRef = useRef(false)
  const sendTypingRef = useRef(sendTyping)
  sendTypingRef.current = sendTyping
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (refreshRef.current) {
      clearInterval(refreshRef.current)
      refreshRef.current = null
    }
    if (!isTypingRef.current) return
    isTypingRef.current = false
    sendTypingRef.current(conversationId, false)
  }, [conversationId])

  const setTyping = useCallback(
    (next: boolean) => {
      if (next) {
        if (!isTypingRef.current) {
          isTypingRef.current = true
          sendTypingRef.current(conversationId, true)
        }
        if (refreshRef.current) return
        refreshRef.current = setInterval(() => {
          sendTypingRef.current(conversationId, true)
        }, TYPING_REFRESH_MS)
        return
      }
      stop()
    },
    [conversationId, stop]
  )

  useEffect(() => stop, [stop])

  return setTyping
}
