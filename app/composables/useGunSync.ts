import Gun from 'gun'
import 'gun/sea'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// Gun.js instance - public relay'ler kullanır, API key gerekmez
const gun = Gun({
    peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        'https://gun-us.herokuapp.com/gun',
    ]
})

export function useGunSync(channelId: string) {
    const status = ref<ConnectionStatus>('disconnected')
    const error = ref<string | null>(null)
    const connectedPeers = ref(0)

    // Gun node referansı
    const channelNode = gun.get('retro').get(channelId)

    // Callback handlers
    const messageHandlers = new Set<(data: any, key: string) => void>()

    // Bağlantıyı başlat
    function connect(): Promise<void> {
        return new Promise((resolve) => {
            status.value = 'connecting'
            console.log('[GUN] Connecting to channel:', channelId)

            // Gun.js otomatik bağlanır, bir süre bekleyip connected say
            setTimeout(() => {
                status.value = 'connected'
                console.log('[GUN] Connected to channel:', channelId)
                resolve()
            }, 500)
        })
    }

    // Kanal verisini yayınla (put)
    function publish(key: string, data: any): void {
        console.log('[GUN] Publishing:', key)
        channelNode.get(key).put(JSON.stringify({
            data,
            timestamp: Date.now()
        }))
    }

    // Kanal verisini dinle (on)
    function subscribe(key: string, callback: (data: any) => void): () => void {
        console.log('[GUN] Subscribing to:', key)

        const handler = channelNode.get(key).on((rawData: any, _key: string) => {
            if (!rawData) return

            try {
                const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData
                if (parsed.data) {
                    console.log('[GUN] Received:', key, parsed.data)
                    callback(parsed.data)
                }
            } catch (e) {
                console.error('[GUN] Parse error:', e)
            }
        })

        // Unsubscribe function
        return () => {
            channelNode.get(key).off()
        }
    }

    // Tüm kanal verisini al (once)
    function fetchOnce(key: string): Promise<any> {
        return new Promise((resolve) => {
            channelNode.get(key).once((rawData: any) => {
                if (!rawData) {
                    resolve(null)
                    return
                }

                try {
                    const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData
                    resolve(parsed.data || null)
                } catch (e) {
                    resolve(null)
                }
            })
        })
    }

    // Bağlantıyı kapat
    function disconnect(): void {
        console.log('[GUN] Disconnecting from channel:', channelId)
        status.value = 'disconnected'
    }

    return {
        status: readonly(status),
        error: readonly(error),
        connectedPeers: readonly(connectedPeers),
        connect,
        publish,
        subscribe,
        fetchOnce,
        disconnect
    }
}
