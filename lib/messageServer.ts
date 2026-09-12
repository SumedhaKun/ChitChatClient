import type {
  MessageAck,
  MessageServerResponse,
  OutgoingMessagePayload,
  ServerErrorResponse,
} from '@/types/messageServer'

const LOCAL_WS_URL = 'ws://localhost:8080'

export function getMessageServerUrl(): string {
  if (process.env.NEXT_PUBLIC_MESSAGE_SERVER_URL) {
    return process.env.NEXT_PUBLIC_MESSAGE_SERVER_URL
  }

  if (typeof window !== 'undefined') {
    const { hostname, host, protocol } = window.location
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
    if (!isLocal) {
      const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
      return `${wsProtocol}//${host}/api/server`
    }
  }

  return LOCAL_WS_URL
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
  resolve: (ack: MessageAck) => void
  reject: (error: MessageServerError) => void
}

export class MessageServerClient {
  private socket: WebSocket | null = null
  private connectPromise: Promise<void> | null = null
  private pending = new Map<string, PendingRequest>()

  constructor(private readonly url: string = getMessageServerUrl()) {}

  connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }

    if (this.connectPromise) {
      return this.connectPromise
    }

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(this.url)

      socket.addEventListener('open', () => {
        this.socket = socket
        this.connectPromise = null
        resolve()
      })

      socket.addEventListener('message', (event) => {
        this.handleMessage(event.data)
      })

      socket.addEventListener('close', () => {
        this.socket = null
        this.connectPromise = null
        this.rejectAllPending('WebSocket connection closed')
      })

      socket.addEventListener('error', () => {
        this.connectPromise = null
        reject(new MessageServerError('Failed to connect to message server', 'CONNECTION_ERROR'))
      })
    })

    return this.connectPromise
  }

  async send(payload: OutgoingMessagePayload): Promise<MessageAck> {
    await this.connect()

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new MessageServerError('Message server is not connected', 'NOT_CONNECTED')
    }

    return new Promise<MessageAck>((resolve, reject) => {
      this.pending.set(payload.messageId, { resolve, reject })
      this.socket!.send(JSON.stringify(payload))
    })
  }

  disconnect(): void {
    this.socket?.close()
    this.socket = null
    this.connectPromise = null
    this.rejectAllPending('Message server disconnected')
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  private handleMessage(raw: unknown): void {
    let response: MessageServerResponse
    try {
      response = JSON.parse(String(raw)) as MessageServerResponse
    } catch {
      this.rejectAllPending('Invalid response from message server')
      return
    }

    if (response.type === 'ack') {
      const pending = this.pending.get(response.messageId)
      if (pending) {
        this.pending.delete(response.messageId)
        pending.resolve(response)
      }
      return
    }

    if (response.type === 'error') {
      if (response.messageId) {
        const pending = this.pending.get(response.messageId)
        if (pending) {
          this.pending.delete(response.messageId)
          pending.reject(
            new MessageServerError(response.message, response.code, response.messageId, response.details)
          )
        }
        return
      }

      this.rejectAllPending(response.message)
    }
  }

  private rejectAllPending(reason: string): void {
    this.pending.forEach((pending, messageId) => {
      pending.reject(new MessageServerError(reason, 'CONNECTION_ERROR', messageId))
    })
    this.pending.clear()
  }
}

let client: MessageServerClient | null = null

export function getMessageServerClient(): MessageServerClient {
  if (!client) {
    client = new MessageServerClient()
  }
  return client
}
