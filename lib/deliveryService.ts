import type { DeliveredMessagePayload, DeliveryServiceResponse } from '@/types/deliveryService'

const LOCAL_WS_URL = 'ws://localhost:8082'

export function getDeliveryServiceUrl(): string {
  return process.env.NEXT_PUBLIC_DELIVERY_SERVICE_URL ?? LOCAL_WS_URL
}

export class DeliveryServiceError extends Error {
  constructor(
    message: string,
    readonly code: string
  ) {
    super(message)
    this.name = 'DeliveryServiceError'
  }
}

export class DeliveryClient {
  private socket: WebSocket | null = null
  private connectPromise: Promise<void> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private manuallyDisconnected = false
  private authenticated = false
  private statusListeners = new Set<(connected: boolean, error?: string) => void>()
  private messageListeners = new Set<(message: DeliveredMessagePayload) => void>()

  constructor(
    private accessToken: string,
    private readonly url: string = getDeliveryServiceUrl()
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
        this.emitStatus(
          false,
          wasAuthenticated ? 'Delivery connection interrupted; retrying…' : undefined
        )
        if (!this.manuallyDisconnected) this.scheduleReconnect()
      })

      socket.addEventListener('error', () => {
        if (!this.authenticated) {
          this.connectPromise = null
          reject(new DeliveryServiceError('Failed to connect to delivery service', 'CONNECTION_ERROR'))
        }
      })
    })

    return this.connectPromise
  }

  disconnect(): void {
    this.manuallyDisconnected = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
    this.socket?.close()
    this.socket = null
    this.authenticated = false
    this.connectPromise = null
    this.emitStatus(false)
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN && this.authenticated
  }

  setAccessToken(accessToken: string): void {
    if (accessToken === this.accessToken) return
    this.accessToken = accessToken
    this.socket?.close()
  }

  subscribeStatus(listener: (connected: boolean, error?: string) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.isConnected())
    return () => this.statusListeners.delete(listener)
  }

  subscribeMessages(listener: (message: DeliveredMessagePayload) => void): () => void {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  private handleMessage(
    raw: unknown,
    resolveConnect: () => void,
    rejectConnect: (error: DeliveryServiceError) => void
  ): void {
    let response: DeliveryServiceResponse
    try {
      response = JSON.parse(String(raw)) as DeliveryServiceResponse
    } catch {
      this.emitStatus(this.isConnected(), 'Invalid response from delivery service')
      return
    }

    if (response.type === 'auth_ack') {
      this.authenticated = true
      this.connectPromise = null
      this.reconnectAttempts = 0
      this.emitStatus(true)
      resolveConnect()
      return
    }

    if (response.type === 'message_created') {
      const delivered = response.message
      this.messageListeners.forEach((listener) => listener(delivered))
      return
    }

    if (response.type === 'error') {
      if (!this.authenticated) {
        const error = new DeliveryServiceError(response.message, response.code)
        this.connectPromise = null
        this.manuallyDisconnected = this.isNonRetryable(response.code)
        rejectConnect(error)
        this.emitStatus(false, response.message)
        if (this.manuallyDisconnected) {
          this.socket?.close()
        }
        return
      }

      this.emitStatus(true, response.message)
    }
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
    return /AUTH/i.test(code)
  }

  private emitStatus(connected: boolean, error?: string): void {
    this.statusListeners.forEach((listener) => listener(connected, error))
  }
}

let client: DeliveryClient | null = null

export function getDeliveryClient(accessToken: string): DeliveryClient {
  if (!client) {
    client = new DeliveryClient(accessToken)
  } else {
    client.setAccessToken(accessToken)
  }
  return client
}
