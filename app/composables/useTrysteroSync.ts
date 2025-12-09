import { joinRoom } from 'trystero'
import type { Room } from 'trystero'
import type { SyncProvider, SyncMessage, ConnectionStatus, SyncRole } from './useSyncProvider'

// Trystero için app ID - tüm retrolar için ortak
const TRYSTERO_APP_ID = 'retro-rtc-v1'

export function useTrysteroSync(): SyncProvider {
    const status = ref<ConnectionStatus>('disconnected')
    const role = ref<SyncRole>(null)
    const error = ref<string | null>(null)
    const connectedPeersCount = ref(0)

    let room: Room | null = null
    let sendSync: ((data: any, targetPeers?: string[]) => void) | null = null
    let selfId: string | null = null

    const messageHandlers = new Set<(message: SyncMessage, peerId: string) => void>()

    // Host olarak başlat
    async function initializeAsHost(channelId: string): Promise<string> {
        status.value = 'connecting'
        role.value = 'host'
        console.log('[TRYSTERO] Host: Initializing room:', channelId)

        try {
            // Trystero room'a katıl
            room = joinRoom({ appId: TRYSTERO_APP_ID }, channelId)

            // Sync action oluştur
            const [send, receive] = room.makeAction('sync')
            sendSync = send

            // Mesaj dinle
            receive((data: any, peerId: string) => {
                console.log('[TRYSTERO] Received from:', peerId, data)
                handleMessage(data, peerId)
            })

            // Peer bağlantılarını izle
            room.onPeerJoin((peerId: string) => {
                console.log('[TRYSTERO] Peer joined:', peerId)
                connectedPeersCount.value++
            })

            room.onPeerLeave((peerId: string) => {
                console.log('[TRYSTERO] Peer left:', peerId)
                connectedPeersCount.value = Math.max(0, connectedPeersCount.value - 1)
            })

            // Self ID oluştur
            selfId = `host_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            // Bağlantı kısa sürede kurulur
            await new Promise(resolve => setTimeout(resolve, 1000))

            status.value = 'connected'
            console.log('[TRYSTERO] Host: Room ready, ID:', selfId)

            return selfId
        } catch (err: any) {
            console.error('[TRYSTERO] Host: Failed to initialize:', err)
            error.value = err.message
            status.value = 'error'
            throw err
        }
    }

    // Guest olarak bağlan
    async function connectAsGuest(channelId: string): Promise<void> {
        status.value = 'connecting'
        role.value = 'guest'
        console.log('[TRYSTERO] Guest: Joining room:', channelId)

        try {
            // Aynı room'a katıl
            room = joinRoom({ appId: TRYSTERO_APP_ID }, channelId)

            // Sync action oluştur
            const [send, receive] = room.makeAction('sync')
            sendSync = send

            // Mesaj dinle
            receive((data: any, peerId: string) => {
                console.log('[TRYSTERO] Received from:', peerId, data)
                handleMessage(data, peerId)
            })

            // Peer bağlantılarını izle
            room.onPeerJoin((peerId: string) => {
                console.log('[TRYSTERO] Peer joined:', peerId)
                connectedPeersCount.value++
            })

            room.onPeerLeave((peerId: string) => {
                console.log('[TRYSTERO] Peer left:', peerId)
                connectedPeersCount.value = Math.max(0, connectedPeersCount.value - 1)
            })

            // Self ID oluştur
            selfId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            // Bağlantı için bekle
            await new Promise(resolve => setTimeout(resolve, 1500))

            status.value = 'connected'
            console.log('[TRYSTERO] Guest: Connected to room')
        } catch (err: any) {
            console.error('[TRYSTERO] Guest: Failed to connect:', err)
            error.value = err.message
            status.value = 'error'
            throw err
        }
    }

    // Mesaj işleyici
    function handleMessage(data: any, peerId: string) {
        const message = data as SyncMessage
        messageHandlers.forEach(handler => {
            handler(message, peerId)
        })
    }

    // Tüm peer'lara broadcast
    function broadcast(message: Omit<SyncMessage, 'timestamp'>): void {
        if (!sendSync) {
            console.warn('[TRYSTERO] Cannot broadcast: not connected')
            return
        }

        const fullMessage: SyncMessage = {
            ...message,
            timestamp: Date.now(),
            senderId: selfId || undefined
        }

        console.log('[TRYSTERO] Broadcasting:', fullMessage.type)
        sendSync(fullMessage)
    }

    // Host'a gönder (Trystero'da broadcast ile aynı)
    function sendToHost(message: Omit<SyncMessage, 'timestamp'>): void {
        // Trystero'da host/guest ayrımı yok, herkese gönderilir
        broadcast(message)
    }

    // Mesaj handler ekle
    function onMessage(handler: (message: SyncMessage, peerId: string) => void): () => void {
        messageHandlers.add(handler)
        return () => messageHandlers.delete(handler)
    }

    // Bağlantıyı kapat
    function disconnect(): void {
        console.log('[TRYSTERO] Disconnecting from room')

        if (room) {
            room.leave()
            room = null
        }

        sendSync = null
        selfId = null
        status.value = 'disconnected'
        role.value = null
        connectedPeersCount.value = 0
    }

    // Cleanup on unmount
    onUnmounted(() => {
        disconnect()
    })

    return {
        status: readonly(status),
        role: readonly(role),
        error: readonly(error),
        connectedPeersCount: readonly(connectedPeersCount),
        initializeAsHost,
        connectAsGuest,
        broadcast,
        sendToHost,
        onMessage,
        disconnect
    }
}
