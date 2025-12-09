import Peer from 'peerjs'
import type { DataConnection } from 'peerjs'

export type MessageType =
    | 'REQUEST_SYNC'
    | 'SYNC_STATE'
    | 'NOTE_ADDED'
    | 'NOTE_UPDATED'
    | 'NOTE_DELETED'
    | 'NOTE_LIKED'
    | 'NOTE_UNLIKED'
    | 'PARTICIPANT_JOINED'
    | 'PARTICIPANT_LEFT'

export interface WebRTCMessage {
    type: MessageType
    payload: any
    timestamp: number
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type PeerRole = 'host' | 'guest' | null

export function useWebRTC() {
    const peer = ref<Peer | null>(null)
    const connections = ref<DataConnection[]>([])
    const status = ref<ConnectionStatus>('disconnected')
    const role = ref<PeerRole>(null)
    const peerId = ref<string | null>(null)
    const error = ref<string | null>(null)

    const messageHandlers = new Set<(message: WebRTCMessage, conn: DataConnection) => void>()

    // Host olarak başlat
    function initializeAsHost(channelId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                status.value = 'connecting'
                role.value = 'host'
                console.log('[DEBUG] Host: Initializing with channelId:', channelId)

                // PeerJS instance oluştur
                peer.value = new Peer(channelId, {
                    debug: 2, // Development için debug modu
                })

                peer.value.on('open', (id) => {
                    peerId.value = id
                    status.value = 'connected'
                    console.log('[DEBUG] Host: Peer initialized and ready. ID:', id)
                    console.log('[DEBUG] Host: Waiting for guest connections...')
                    resolve(id)
                })

                peer.value.on('connection', (conn) => {
                    console.log('[DEBUG] Host: New guest connection attempt from:', conn.peer)
                    setupConnection(conn)
                })

                peer.value.on('error', (err) => {
                    console.error('[DEBUG] Host: Peer error:', err.type, err.message)
                    error.value = err.message
                    status.value = 'error'
                    reject(err)
                })

                peer.value.on('disconnected', () => {
                    console.log('[DEBUG] Host: Disconnected from signaling server')
                    status.value = 'disconnected'
                })
            } catch (err: any) {
                console.error('[DEBUG] Host: Failed to initialize:', err)
                error.value = err.message
                status.value = 'error'
                reject(err)
            }
        })
    }

    // Guest olarak bağlan
    function connectAsGuest(hostPeerId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                status.value = 'connecting'
                role.value = 'guest'
                console.log('[DEBUG] Guest: Starting connection to host:', hostPeerId)

                // PeerJS instance oluştur (random ID)
                peer.value = new Peer({
                    debug: 2,
                })

                // Connection timeout - 15 saniye
                const connectionTimeout = setTimeout(() => {
                    console.error('[DEBUG] Guest: Connection timeout after 15s - Host may be offline')
                    console.error('[DEBUG] Guest: Current status:', status.value)
                    console.error('[DEBUG] Guest: Connections count:', connections.value.length)
                    error.value = 'Connection timeout - Host may be offline'
                    status.value = 'error'
                    reject(new Error('Connection timeout'))
                }, 15000)

                peer.value.on('open', (id) => {
                    peerId.value = id
                    console.log('[DEBUG] Guest: Peer initialized with ID:', id)
                    console.log('[DEBUG] Guest: Attempting to connect to host:', hostPeerId)

                    // Host'a bağlan
                    const conn = peer.value!.connect(hostPeerId, {
                        reliable: true, // Güvenilir data channel
                    })

                    console.log('[DEBUG] Guest: Connection object created, waiting for open event...')

                    setupConnection(conn)

                    conn.on('open', () => {
                        clearTimeout(connectionTimeout)
                        status.value = 'connected'
                        console.log('[DEBUG] Guest: Successfully connected to host:', hostPeerId)
                        resolve()
                    })

                    conn.on('error', (err) => {
                        console.error('[DEBUG] Guest: Connection-level error:', err)
                    })
                })

                peer.value.on('error', (err) => {
                    clearTimeout(connectionTimeout)
                    console.error('[DEBUG] Guest: Peer-level error:', err.type, err.message)
                    error.value = err.message
                    status.value = 'error'
                    reject(err)
                })

                peer.value.on('disconnected', () => {
                    console.log('[DEBUG] Guest: Peer disconnected from signaling server')
                    status.value = 'disconnected'
                })
            } catch (err: any) {
                console.error('[DEBUG] Guest: Failed to initialize:', err)
                error.value = err.message
                status.value = 'error'
                reject(err)
            }
        })
    }

    const connectionHandlers = new Set<(conn: DataConnection) => void>()

    // Connection setup
    function setupConnection(conn: DataConnection) {
        connections.value.push(conn)

        conn.on('open', () => {
            console.log('Connection opened:', conn.peer)
            // Yeni bağlantı handler'larını çağır
            connectionHandlers.forEach(handler => handler(conn))
        })

        conn.on('data', (data) => {
            try {
                const message = data as WebRTCMessage
                console.log('Received message:', message.type, message.payload)

                // Tüm handler'ları çağır
                messageHandlers.forEach(handler => {
                    handler(message, conn)
                })
            } catch (err) {
                console.error('Error handling message:', err)
            }
        })

        conn.on('close', () => {
            console.log('Connection closed:', conn.peer)
            connections.value = connections.value.filter(c => c !== conn)

            if (connections.value.length === 0 && role.value === 'guest') {
                status.value = 'disconnected'
            }
        })

        conn.on('error', (err) => {
            console.error('Connection error:', err)
            error.value = err.message
        })
    }

    // Yeni bağlantı handler ekle
    function onConnection(handler: (conn: DataConnection) => void) {
        connectionHandlers.add(handler)
        return () => connectionHandlers.delete(handler)
    }

    // Mesaj gönder (Host -> tüm guest'ler)
    function broadcast(message: Omit<WebRTCMessage, 'timestamp'>) {
        if (role.value !== 'host') {
            console.warn('Only host can broadcast')
            return
        }

        const fullMessage: WebRTCMessage = {
            ...message,
            timestamp: Date.now()
        }

        console.log('Broadcasting to', connections.value.length, 'peers:', fullMessage.type)

        connections.value.forEach(conn => {
            if (conn.open) {
                conn.send(fullMessage)
            }
        })
    }

    // Mesaj gönder (Guest -> Host)
    function sendToHost(message: Omit<WebRTCMessage, 'timestamp'>) {
        if (role.value !== 'guest') {
            console.warn('Only guest can send to host')
            return
        }

        if (connections.value.length === 0) {
            console.warn('No connection to host')
            return
        }

        const fullMessage: WebRTCMessage = {
            ...message,
            timestamp: Date.now()
        }

        console.log('Sending to host:', fullMessage.type)

        const hostConn = connections.value[0]
        if (hostConn && hostConn.open) {
            hostConn.send(fullMessage)
        }
    }

    // Mesaj handler ekle
    function onMessage(handler: (message: WebRTCMessage, conn: DataConnection) => void) {
        messageHandlers.add(handler)

        // Cleanup function
        return () => {
            messageHandlers.delete(handler)
        }
    }

    // Bağlantıyı kapat
    function disconnect() {
        console.log('Disconnecting peer')

        connections.value.forEach(conn => {
            conn.close()
        })
        connections.value = []

        if (peer.value) {
            peer.value.destroy()
            peer.value = null
        }

        status.value = 'disconnected'
        role.value = null
        peerId.value = null
        error.value = null
    }

    // Cleanup on unmount
    onUnmounted(() => {
        disconnect()
    })

    return {
        // State
        status: readonly(status),
        role: readonly(role),
        peerId: readonly(peerId),
        error: readonly(error),
        connectedPeersCount: computed(() => connections.value.length),

        // Methods
        initializeAsHost,
        connectAsGuest,
        broadcast,
        sendToHost,
        onMessage,
        onConnection,
        disconnect
    }
}
