import type {
  MessageAck,
  MessageServerResponse,
  OutgoingMessagePayload,
  ServerErrorResponse,
} from '@/types/messageServer'

const LOCAL_WS_URL = 'ws://localhost:8080'

export function getMessageServerUrl(): string {
  return process.env.NEXT_PUBLIC_MESSAGE_SERVER_URL ?? LOCAL_WS_URL
}

export class MessageServerError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly messageId?: string,
    readonly details?: ServerErrorResponse['details']
  ) {
    super(message)
    this.name = 'MessageServerError'
  }
}

type PendingRequest = {
  payload: OutgoingMessagePayload
  resolve: (ack: MessageAck) => void
  reject: (error: MessageServerError) => void
  sentOn?: WebSocket
}

export class MessageServerClient {
  private socket: WebSocket | null = null
  private connectPromise: Promise<void> | null = null
  private pending = new Map<string, PendingRequest>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private manuallyDisconnected = false
  private authenticated = false
  private listeners = new Set<(connected: boolean, error?: string) => void>()

  constructor(
    private accessToken: string,
    private readonly url: string = getMessageServerUrl()
  ) {}

  connect(): Promise<void> {
    this.manuallyDisconnected = false
    if (this.socket?.readyState === WebSocket.OPEN && this.authenticated) {
      return Promise.resolve()
    }

    if (this.connectPromise) {
      return this.connectPromise
    }

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(this.url)
      this.socket = socket

      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ type: 'auth', accessToken: this.accessToken }))
      })

      socket.addEventListener('message', (event) => {
        this.handleMessage(event.data, resolve, reject)
      })

      socket.addEventListener('close', () => {
        const wasAuthenticated = this.authenticated
        this.socket = null
        this.authenticated = false
        this.connectPromise = null
        this.emit(false, wasAuthenticated ? 'Message connection interrupted; retrying…' : undefined)
        if (!this.manuallyDisconnected) this.scheduleReconnect()
      })

      socket.addEventListener('error', () => {
        if (!this.authenticated) {
          this.connectPromise = null
          reject(new MessageServerError('Failed to connect to message server', 'CONNECTION_ERROR'))
        }
      })
    })

    return this.connectPromise
  }

  async send(payload: OutgoingMessagePayload): Promise<MessageAck> {
    return new Promise<MessageAck>((resolve, reject) => {
      const existing = this.pending.get(payload.messageId)
      if (existing) {
        reject(new MessageServerError('Message is already queued', 'DUPLICATE_CLIENT_ID', payload.messageId))
        return
      }
      this.pending.set(payload.messageId, { payload, resolve, reject })
      if (this.isConnected()) {
        this.flushQueue()
      } else {
        this.connect().catch(() => this.scheduleReconnect())
      }
    })
  }

  disconnect(): void {
    this.manuallyDisconnected = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
    this.socket?.close()
    this.socket = null
    this.authenticated = false
    this.connectPromise = null
    this.rejectAllPending('Message server disconnected', 'DISCONNECTED')
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN && this.authenticated
  }

  setAccessToken(accessToken: string): void {
    if (accessToken === this.accessToken) return
    this.accessToken = accessToken
    this.socket?.close()
  }

  subscribe(listener: (connected: boolean, error?: string) => void): () => void {
    this.listeners.add(listener)
    listener(this.isConnected())
    return () => this.listeners.delete(listener)
  }

  private handleMessage(
    raw: unknown,
    resolveConnect: () => void,
    rejectConnect: (error: MessageServerError) => void
  ): void {
    let response: MessageServerResponse
    try {
      response = JSON.parse(String(raw)) as MessageServerResponse
    } catch {
      this.emit(this.isConnected(), 'Invalid response from message server')
      return
    }

    if (response.type === 'auth_ack') {
      this.authenticated = true
      this.connectPromise = null
      this.reconnectAttempts = 0
      this.emit(true)
      resolveConnect()
      this.flushQueue()
      return
    }

    if (response.type === 'ack') {
      const pending = this.pending.get(response.messageId)
      if (pending) {
        this.pending.delete(response.messageId)
        pending.resolve({
          ...response,
          message: {
            ...response.message,
            createdAt:
              typeof response.message.createdAt === 'string'
                ? response.message.createdAt
                : new Date(response.message.createdAt as unknown as string).toISOString(),
          },
        })
      }
      return
    }

    if (response.type === 'error') {
      if (response.messageId) {
        const pending = this.pending.get(response.messageId)
        if (pending && this.isNonRetryable(response.code)) {
          this.pending.delete(response.messageId)
          pending.reject(
            new MessageServerError(response.message, response.code, response.messageId, response.details)
          )
        }
        if (pending) this.socket?.close()
        return
      }

      if (!this.authenticated) {
        const error = new MessageServerError(response.message, response.code)
        this.connectPromise = null
        this.manuallyDisconnected = this.isNonRetryable(response.code)
        rejectConnect(error)
        this.emit(false, response.message)
        if (this.manuallyDisconnected) {
          this.rejectAllPending(response.message, response.code)
          this.socket?.close()
        }
      } else {
        this.emit(true, response.message)
      }
    }
  }

  private flushQueue(): void {
    if (!this.socket || !this.isConnected()) return
    this.pending.forEach((pending) => {
      if (pending.sentOn === this.socket) return
      this.socket!.send(JSON.stringify(pending.payload))
      pending.sentOn = this.socket!
    })
  }

  private scheduleReconnect(): void {
    if (this.manuallyDisconnected || this.reconnectTimer) return
    const delay = Math.min(30_000, 500 * 2 ** this.reconnectAttempts)
    this.reconnectAttempts += 1
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect().catch(() => this.scheduleReconnect())
    }, delay)
  }

  private isNonRetryable(code: string): boolean {
    return /AUTH|VALID|MEMBER|FORBIDDEN|CONFLICT|DUPLICATE|NOT_FOUND|CONTENT|MESSAGE_ID/i.test(code)
  }

  private emit(connected: boolean, error?: string): void {
    this.listeners.forEach((listener) => listener(connected, error))
  }

  private rejectAllPending(reason: string, code: string): void {
    this.pending.forEach((pending, messageId) => {
      pending.reject(new MessageServerError(reason, code, messageId))
    })
    this.pending.clear()
  }
}

let client: MessageServerClient | null = null

export function getMessageServerClient(accessToken: string): MessageServerClient {
  if (!client) {
    client = new MessageServerClient(accessToken)
  } else {
    client.setAccessToken(accessToken)
  }
  return client
}
