import type { Ref } from 'vue'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type SyncRole = 'host' | 'guest' | null
export type ProviderType = 'peerjs' | 'trystero' | 'gun' | 'supabase'

export interface SyncMessage {
    type: string
    payload: any
    timestamp: number
    senderId?: string
}

export interface SyncProvider {
    // State
    status: Readonly<Ref<ConnectionStatus>>
    role: Readonly<Ref<SyncRole>>
    error: Readonly<Ref<string | null>>
    connectedPeersCount: Readonly<Ref<number>>

    // Connection
    initializeAsHost(channelId: string): Promise<string>
    connectAsGuest(channelId: string): Promise<void>
    disconnect(): void

    // Messaging
    broadcast(message: Omit<SyncMessage, 'timestamp'>): void
    sendToHost(message: Omit<SyncMessage, 'timestamp'>): void
    onMessage(handler: (message: SyncMessage, peerId: string) => void): () => void

    // Optional: for providers that support custom config
    setCredentials?(url: string, key: string): void
}

// Provider bilgileri
export const PROVIDER_INFO: Record<ProviderType, { name: string; icon: string; description: string }> = {
    peerjs: {
        name: 'PeerJS',
        icon: '🔗',
        description: 'WebRTC + PeerJS Signaling'
    },
    trystero: {
        name: 'Trystero',
        icon: '🌊',
        description: 'BitTorrent/IPFS üzerinden P2P'
    },
    gun: {
        name: 'Gun.js',
        icon: '🔫',
        description: 'Decentralized database sync'
    },
    supabase: {
        name: 'Supabase',
        icon: '⚡',
        description: 'Realtime WebSocket Sync (VPN-Safe)'
    }
}
