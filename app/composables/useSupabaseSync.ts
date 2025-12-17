import { createClient } from '@supabase/supabase-js'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { SyncProvider, SyncMessage, ConnectionStatus, SyncRole } from './useSyncProvider'

export function useSupabaseSync(): SyncProvider {
    const config = useRuntimeConfig()
    const status = ref<ConnectionStatus>('disconnected')
    const role = ref<SyncRole>(null)
    const error = ref<string | null>(null)
    const connectedPeersCount = ref(0)

    // Self ID for this session
    const selfId = ref<string>(`peer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

    let supabase: ReturnType<typeof createClient> | null = null
    let channel: RealtimeChannel | null = null
    const messageHandlers = new Set<(message: SyncMessage, peerId: string) => void>()

    const customCredentials = ref<{ url: string; key: string } | null>(null)

    // Set custom credentials (from user input or URL)
    function setCredentials(url: string, key: string) {
        customCredentials.value = { url, key }
        // If client already exists but with different credentials or undefined, reset it
        if (supabase) {
            disconnect()
            supabase = null
        }
    }

    // Initialize Supabase Client
    function initClient() {
        if (supabase) return true

        let url = config.public.supabaseUrl as string
        let key = config.public.supabaseKey as string

        // Override with custom credentials if available
        if (customCredentials.value) {
            url = customCredentials.value.url
            key = customCredentials.value.key
        }

        if (!url || !key) {
            error.value = 'Supabase credentials missing. Please check configuration or enter custom keys.'
            status.value = 'error'
            console.error('[SUPABASE] Missing credentials')
            return false
        }

        try {
            supabase = createClient(url, key, {
                realtime: {
                    params: {
                        eventsPerSecond: 10,
                    },
                },
            })
            return true
        } catch (err: any) {
            console.error('[SUPABASE] Client init failed:', err)
            error.value = err.message
            status.value = 'error'
            return false
        }
    }

    // Initialize Channel
    async function initChannel(channelId: string, isHost: boolean) {
        if (!initClient() || !supabase) return

        status.value = 'connecting'
        role.value = isHost ? 'host' : 'guest'

        // Clean up previous channel if exists
        if (channel) {
            await supabase.removeChannel(channel)
        }

        console.log(`[SUPABASE] ${isHost ? 'Host' : 'Guest'} joining channel: retro:${channelId}`)

        // Create channel with presence enabled
        channel = supabase.channel(`retro:${channelId}`, {
            config: {
                presence: {
                    key: selfId.value,
                },
                broadcast: {
                    self: false, // Don't receive own messages
                    ack: true,   // Acknowledge delivery
                }
            }
        })

        // Subscribe to events
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel?.presenceState()
                if (state) {
                    // Count unique users excluding self (state keys are user IDs)
                    const users = Object.keys(state)
                    connectedPeersCount.value = Math.max(0, users.length - 1)
                    console.log('[SUPABASE] Presence sync, connected peers:', connectedPeersCount.value)
                }
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('[SUPABASE] Peer joined:', key, newPresences)
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('[SUPABASE] Peer left:', key, leftPresences)
            })
            .on('broadcast', { event: 'sync-msg' }, ({ payload }) => {
                console.log('[SUPABASE] Received message:', payload)
                const message = payload as SyncMessage
                // Use senderId from payload if available, or just 'unknown'
                messageHandlers.forEach(handler => handler(message, message.senderId || 'unknown'))
            })
            .subscribe(async (statusStr) => {
                if (statusStr === 'SUBSCRIBED') {
                    console.log('[SUPABASE] Connected to channel')
                    status.value = 'connected'
                    error.value = null

                    // Track presence
                    await channel?.track({
                        online_at: new Date().toISOString(),
                        role: role.value
                    })
                } else if (statusStr === 'CHANNEL_ERROR') {
                    console.error('[SUPABASE] Connection error')
                    status.value = 'error'
                    error.value = 'Connection failed'
                } else if (statusStr === 'TIMED_OUT') {
                    console.error('[SUPABASE] Connection timed out')
                    status.value = 'error'
                    error.value = 'Connection timeout'
                }
            })
    }

    async function initializeAsHost(channelId: string): Promise<string> {
        await initChannel(channelId, true)
        return selfId.value
    }

    async function connectAsGuest(channelId: string): Promise<void> {
        await initChannel(channelId, false)
    }

    function broadcast(message: Omit<SyncMessage, 'timestamp'>): void {
        if (!channel || status.value !== 'connected') {
            console.warn('[SUPABASE] Cannot broadcast: not connected')
            return
        }

        const fullMessage: SyncMessage = {
            ...message,
            timestamp: Date.now(),
            senderId: selfId.value
        }

        channel.send({
            type: 'broadcast',
            event: 'sync-msg',
            payload: fullMessage
        }).catch(err => {
            console.error('[SUPABASE] Broadcast failed:', err)
        })
    }

    function sendToHost(message: Omit<SyncMessage, 'timestamp'>): void {
        // In Supabase/PubSub, everyone receives broadcasts.
        // We broadcast, and let the host filter if needed (or just process it).
        // Since we are implementing the SyncProvider interface, we just map this to broadcast.
        broadcast(message)
    }

    function onMessage(handler: (message: SyncMessage, peerId: string) => void): () => void {
        messageHandlers.add(handler)
        return () => messageHandlers.delete(handler)
    }

    function disconnect(): void {
        console.log('[SUPABASE] Disconnecting...')
        if (channel) {
            supabase?.removeChannel(channel)
            channel = null
        }
        status.value = 'disconnected'
        role.value = null
        connectedPeersCount.value = 0
    }

    // Cleanup
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
        disconnect,
        setCredentials
    }
}
