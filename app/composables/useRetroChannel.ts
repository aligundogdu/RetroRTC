import { getParticipantColor, getRandomPostItColor } from '~/utils/colors'
import { generateRandomNickname } from '~/utils/nicknames'
import type { WebRTCMessage } from './useWebRTC'
import type { ProviderType, SyncMessage } from './useSyncProvider'

export interface PostItNote {
    id: string
    columnId: string
    content: string
    authorId: string
    authorName: string
    color: string
    likes: string[] // Beğenen kullanıcıların ID'leri
    createdAt: number
    updatedAt: number
}

export interface Column {
    id: string
    name: string
    order: number
}

export interface Participant {
    id: string
    name: string
    color: string
    joinedAt: number
    isCreator: boolean
}

export interface RetroChannel {
    id: string
    name: string
    isAnonymous: boolean
    columns: Column[]
    notes: PostItNote[]
    participants: Participant[]
    createdAt: number
    creatorId: string
    syncProvider?: ProviderType // Hangi provider kullanıldığı
}

const STORAGE_PREFIX = 'retro_channel_'
const PARTICIPANT_KEY = 'retro_participant_'

export function useRetroChannel(channelId: string, providerType: ProviderType = 'peerjs') {
    const channel = ref<RetroChannel | null>(null)
    const currentParticipant = ref<Participant | null>(null)
    const activeProvider = ref<ProviderType>(providerType)

    const storageKey = `${STORAGE_PREFIX}${channelId}`
    const participantKey = `${PARTICIPANT_KEY}${channelId}`

    // Her iki provider'ı da oluştur - sadece aktif olan kullanılacak
    const webrtc = useWebRTC()
    const trystero = useTrysteroSync()

    // Aktif provider'ın status ve role bilgileri
    const syncStatus = computed(() => {
        if (activeProvider.value === 'trystero' && trystero) {
            return trystero.status.value
        }
        return webrtc?.status.value || 'disconnected'
    })

    const syncRole = computed(() => {
        if (activeProvider.value === 'trystero' && trystero) {
            return trystero.role.value
        }
        return webrtc?.role.value || null
    })

    const connectedPeersCount = computed(() => {
        if (activeProvider.value === 'trystero' && trystero) {
            return trystero.connectedPeersCount.value
        }
        return webrtc?.connectedPeersCount.value || 0
    })

    // Provider-agnostic helper functions
    function getActiveRole() {
        return activeProvider.value === 'trystero' ? trystero.role.value : getActiveRole()
    }

    function doBroadcast(message: Omit<WebRTCMessage, 'timestamp'>) {
        if (activeProvider.value === 'trystero') {
            trystero.broadcast(message as any)
        } else {
            doBroadcast(message)
        }
    }

    function doSendToHost(message: Omit<WebRTCMessage, 'timestamp'>) {
        if (activeProvider.value === 'trystero') {
            trystero.sendToHost(message as any)
        } else {
            doSendToHost(message)
        }
    }

    // Kanal oluştur (Host)
    async function createChannel(name: string, isAnonymous: boolean, columns: string[]): Promise<RetroChannel> {
        const participantId = generateId()
        const creatorName = isAnonymous ? generateRandomNickname() : ''

        const newChannel: RetroChannel = {
            id: channelId,
            name,
            isAnonymous,
            columns: columns.map((col, index) => ({
                id: generateId(),
                name: col,
                order: index
            })),
            notes: [],
            participants: [{
                id: participantId,
                name: creatorName,
                color: getParticipantColor(0),
                joinedAt: Date.now(),
                isCreator: true
            }],
            createdAt: Date.now(),
            creatorId: participantId
        }

        saveChannel(newChannel)
        saveParticipant(newChannel.participants[0]!)

        // WebRTC host olarak başlat
        await initializeHost()

        return newChannel
    }

    // Host olarak başlat (aktif provider'a göre)
    async function initializeHost() {
        try {
            if (activeProvider.value === 'trystero') {
                await trystero.initializeAsHost(channelId)
                console.log('[DEBUG] Trystero host initialized successfully')
            } else {
                await webrtc.initializeAsHost(channelId)
                console.log('[DEBUG] WebRTC host initialized successfully')
            }
        } catch (err) {
            console.error('[DEBUG] Failed to initialize host:', err)
            // Hatayı fırlat ki çağıran kod localStorage sync moduna geçebilsin
            throw err
        }
    }

    // Kanala bağlan (Guest) - Retry mekanizmalı
    async function joinChannel(retryCount = 0): Promise<void> {
        console.log('[DEBUG] joinChannel: Starting attempt', retryCount + 1, 'provider:', activeProvider.value)

        try {
            if (activeProvider.value === 'trystero') {
                await trystero.connectAsGuest(channelId)
                console.log('[DEBUG] joinChannel: Connected via Trystero, requesting sync...')

                // Kanal verisini iste
                trystero.sendToHost({
                    type: 'REQUEST_SYNC',
                    payload: null
                })
            } else {
                await webrtc.connectAsGuest(channelId)
                console.log('[DEBUG] joinChannel: Connected as guest, now requesting sync...')

                // Kanal verisini iste
                doSendToHost({
                    type: 'REQUEST_SYNC',
                    payload: null
                })
            }
            console.log('[DEBUG] joinChannel: REQUEST_SYNC sent to host')
        } catch (err) {
            console.error(`[DEBUG] joinChannel: Failed to connect (attempt ${retryCount + 1}):`, err)

            // 5 kereye kadar tekrar dene (artan bekleme süresiyle)
            if (retryCount < 5) {
                const delay = 1000 * Math.pow(1.5, retryCount) // 1s, 1.5s, 2.25s...
                console.log(`[DEBUG] joinChannel: Retrying in ${delay}ms...`)
                setTimeout(() => {
                    joinChannel(retryCount + 1)
                }, delay)
            } else {
                console.error('[DEBUG] joinChannel: Max retries reached. Host may be offline.')
            }
        }
    }

    // Katılımcı oluştur ve kanala dahil et
    function createParticipant(name: string) {
        if (!channel.value) return

        const participantId = generateId()
        const participantName = channel.value.isAnonymous ? generateRandomNickname() : name

        const newParticipant: Participant = {
            id: participantId,
            name: participantName,
            color: getParticipantColor(channel.value.participants.length),
            joinedAt: Date.now(),
            isCreator: false
        }

        // Host'a katılım mesajı gönder
        doSendToHost({
            type: 'PARTICIPANT_JOINED',
            payload: newParticipant
        })

        saveParticipant(newParticipant)

        // Local state güncelle (Guest için)
        if (!channel.value.participants.find(p => p.id === newParticipant.id)) {
            channel.value.participants.push(newParticipant)
        }
    }

    // Not ekle
    function addNote(columnId: string, content: string) {
        if (!channel.value || !currentParticipant.value) return

        const newNote: PostItNote = {
            id: generateId(),
            columnId,
            content,
            authorId: currentParticipant.value.id,
            authorName: currentParticipant.value.name,
            color: getRandomPostItColor(),
            likes: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        channel.value.notes.push(newNote)
        saveChannel(channel.value)

        // WebRTC ile broadcast/send
        if (getActiveRole() === 'host') {
            doBroadcast({
                type: 'NOTE_ADDED',
                payload: newNote
            })
        } else if (getActiveRole() === 'guest') {
            doSendToHost({
                type: 'NOTE_ADDED',
                payload: newNote
            })
        }
    }

    // Not güncelle
    function updateNote(noteId: string, content: string) {
        if (!channel.value || !currentParticipant.value) return

        const note = channel.value.notes.find(n => n.id === noteId)
        if (!note || note.authorId !== currentParticipant.value.id) return

        note.content = content
        note.updatedAt = Date.now()
        saveChannel(channel.value)

        // WebRTC ile broadcast/send
        if (getActiveRole() === 'host') {
            doBroadcast({
                type: 'NOTE_UPDATED',
                payload: { noteId, content }
            })
        } else if (getActiveRole() === 'guest') {
            doSendToHost({
                type: 'NOTE_UPDATED',
                payload: { noteId, content }
            })
        }
    }

    // Not sil
    function deleteNote(noteId: string) {
        if (!channel.value || !currentParticipant.value) return

        const noteIndex = channel.value.notes.findIndex(n => n.id === noteId)
        if (noteIndex === -1) return

        const note = channel.value.notes[noteIndex]
        if (!note || note.authorId !== currentParticipant.value.id) return

        channel.value.notes.splice(noteIndex, 1)
        saveChannel(channel.value)

        // WebRTC ile broadcast/send
        if (getActiveRole() === 'host') {
            doBroadcast({
                type: 'NOTE_DELETED',
                payload: { noteId }
            })
        } else if (getActiveRole() === 'guest') {
            doSendToHost({
                type: 'NOTE_DELETED',
                payload: { noteId }
            })
        }
    }

    // Nota like at
    function likeNote(noteId: string) {
        if (!channel.value || !currentParticipant.value) return

        const note = channel.value.notes.find(n => n.id === noteId)
        if (!note) return

        // Zaten like atmışsa çık
        if (note.likes.includes(currentParticipant.value.id)) return

        note.likes.push(currentParticipant.value.id)
        saveChannel(channel.value)

        // WebRTC ile broadcast/send
        if (getActiveRole() === 'host') {
            doBroadcast({
                type: 'NOTE_LIKED',
                payload: { noteId, userId: currentParticipant.value.id }
            })
        } else if (getActiveRole() === 'guest') {
            doSendToHost({
                type: 'NOTE_LIKED',
                payload: { noteId, userId: currentParticipant.value.id }
            })
        }
    }

    // Nottan like kaldır
    function unlikeNote(noteId: string) {
        if (!channel.value || !currentParticipant.value) return

        const note = channel.value.notes.find(n => n.id === noteId)
        if (!note) return

        const likeIndex = note.likes.indexOf(currentParticipant.value.id)
        if (likeIndex === -1) return

        note.likes.splice(likeIndex, 1)
        saveChannel(channel.value)

        // WebRTC ile broadcast/send
        if (getActiveRole() === 'host') {
            doBroadcast({
                type: 'NOTE_UNLIKED',
                payload: { noteId, userId: currentParticipant.value.id }
            })
        } else if (getActiveRole() === 'guest') {
            doSendToHost({
                type: 'NOTE_UNLIKED',
                payload: { noteId, userId: currentParticipant.value.id }
            })
        }
    }

    // Kolon notlarını getir
    function getNotesByColumn(columnId: string): PostItNote[] {
        if (!channel.value) return []
        return channel.value.notes.filter(n => n.columnId === columnId)
    }

    // LocalStorage'a kaydet
    function saveChannel(data: RetroChannel) {
        if (import.meta.client) {
            if (!data) {
                console.error('Attempted to save null/undefined channel data')
                return
            }
            console.log('Saving channel data:', data.id, 'Notes:', data.notes.length)
            localStorage.setItem(storageKey, JSON.stringify(data))
            channel.value = data
        }
    }

    // LocalStorage'dan yükle (ve channel.value'yu güncelle)
    function loadChannel(): RetroChannel | null {
        if (!import.meta.client) return null

        const data = localStorage.getItem(storageKey)
        if (!data) {
            console.log('No channel data in localStorage')
            return null
        }

        try {
            const parsed = JSON.parse(data)
            console.log('[DEBUG] Loaded channel from localStorage:', parsed.id)
            // channel.value'yu da güncelle ki UI reaktif olsun
            channel.value = parsed
            return parsed
        } catch (e) {
            console.error('Failed to parse channel data from localStorage:', e)
            return null
        }
    }

    // Katılımcıyı kaydet
    function saveParticipant(participant: Participant) {
        if (import.meta.client) {
            localStorage.setItem(participantKey, JSON.stringify(participant))
            currentParticipant.value = participant
        }
    }

    // Katılımcıyı yükle (ve currentParticipant.value'yu güncelle)
    function loadParticipant(): Participant | null {
        if (!import.meta.client) return null

        const data = localStorage.getItem(participantKey)
        if (!data) return null

        try {
            const parsed = JSON.parse(data)
            // currentParticipant.value'yu da güncelle
            currentParticipant.value = parsed
            return parsed
        } catch {
            return null
        }
    }

    // WebRTC mesaj handler
    function handleWebRTCMessage(message: WebRTCMessage, conn: any) {
        console.log('[DEBUG] handleWebRTCMessage: Received', message.type, 'from', conn?.peer)
        console.log('[DEBUG] handleWebRTCMessage: Current role:', getActiveRole())
        console.log('[DEBUG] handleWebRTCMessage: Current channel:', channel.value?.id || 'null')

        switch (message.type) {
            case 'REQUEST_SYNC':
                console.log('[DEBUG] REQUEST_SYNC: Processing...')
                if (getActiveRole() === 'host' && channel.value) {
                    console.log('[DEBUG] REQUEST_SYNC: Host has channel data, sending SYNC_STATE to:', conn.peer)
                    console.log('[DEBUG] REQUEST_SYNC: Channel data preview:', {
                        id: channel.value.id,
                        name: channel.value.name,
                        columnsCount: channel.value.columns.length,
                        notesCount: channel.value.notes.length,
                        participantsCount: channel.value.participants.length
                    })
                    conn.send({
                        type: 'SYNC_STATE',
                        payload: channel.value,
                        timestamp: Date.now()
                    })
                    console.log('[DEBUG] REQUEST_SYNC: SYNC_STATE sent successfully')
                } else if (getActiveRole() === 'host' && !channel.value) {
                    console.error('[DEBUG] REQUEST_SYNC: ERROR - Host has no channel data!')
                } else {
                    console.log('[DEBUG] REQUEST_SYNC: Ignored (not host or no channel)')
                }
                break

            case 'SYNC_STATE':
                // Guest: Host'tan tam state al
                console.log('[DEBUG] SYNC_STATE: Processing...')
                if (getActiveRole() === 'guest') {
                    const syncedChannel = message.payload as RetroChannel
                    if (syncedChannel) {
                        console.log('[DEBUG] SYNC_STATE: Received channel data from host:', {
                            id: syncedChannel.id,
                            name: syncedChannel.name,
                            columnsCount: syncedChannel.columns.length,
                            notesCount: syncedChannel.notes.length,
                            participantsCount: syncedChannel.participants.length
                        })
                        saveChannel(syncedChannel)
                        console.log('[DEBUG] SYNC_STATE: Channel saved successfully')
                    } else {
                        console.error('[DEBUG] SYNC_STATE: ERROR - Received empty payload from host')
                    }
                } else {
                    console.log('[DEBUG] SYNC_STATE: Ignored (not guest)')
                }
                break

            case 'PARTICIPANT_JOINED':
                // Host: Yeni katılımcıyı ekle ve broadcast et
                if (getActiveRole() === 'host' && channel.value) {
                    const newParticipant = message.payload as Participant
                    channel.value.participants.push(newParticipant)
                    saveChannel(channel.value)

                    // Yeni katılımcıya mevcut state'i gönder
                    doBroadcast({
                        type: 'SYNC_STATE',
                        payload: channel.value
                    })

                    console.log('New participant joined:', newParticipant.name)
                }
                // Guest: Katılımcı listesini güncelle
                else if (getActiveRole() === 'guest' && channel.value) {
                    const newParticipant = message.payload as Participant
                    if (!channel.value.participants.find(p => p.id === newParticipant.id)) {
                        channel.value.participants.push(newParticipant)
                        saveChannel(channel.value)
                    }
                }
                break

            case 'NOTE_ADDED':
                if (channel.value) {
                    const newNote = message.payload as PostItNote

                    // Duplicate kontrolü
                    if (!channel.value.notes.find(n => n.id === newNote.id)) {
                        channel.value.notes.push(newNote)
                        saveChannel(channel.value)

                        // Host ise diğer guest'lere broadcast et
                        if (getActiveRole() === 'host') {
                            doBroadcast({
                                type: 'NOTE_ADDED',
                                payload: newNote
                            })
                        }
                    }
                }
                break

            case 'NOTE_UPDATED':
                if (channel.value) {
                    const { noteId, content } = message.payload
                    const note = channel.value.notes.find(n => n.id === noteId)

                    if (note) {
                        note.content = content
                        note.updatedAt = Date.now()
                        saveChannel(channel.value)

                        // Host ise diğer guest'lere broadcast et
                        if (getActiveRole() === 'host') {
                            doBroadcast({
                                type: 'NOTE_UPDATED',
                                payload: { noteId, content }
                            })
                        }
                    }
                }
                break

            case 'NOTE_DELETED':
                if (channel.value) {
                    const { noteId } = message.payload
                    const noteIndex = channel.value.notes.findIndex(n => n.id === noteId)

                    if (noteIndex !== -1) {
                        channel.value.notes.splice(noteIndex, 1)
                        saveChannel(channel.value)

                        // Host ise diğer guest'lere broadcast et
                        if (getActiveRole() === 'host') {
                            doBroadcast({
                                type: 'NOTE_DELETED',
                                payload: { noteId }
                            })
                        }
                    }
                }
                break

            case 'NOTE_LIKED':
                if (channel.value) {
                    const { noteId, userId } = message.payload
                    const note = channel.value.notes.find(n => n.id === noteId)

                    if (note && !note.likes.includes(userId)) {
                        note.likes.push(userId)
                        saveChannel(channel.value)

                        // Host ise diğer guest'lere broadcast et
                        if (getActiveRole() === 'host') {
                            doBroadcast({
                                type: 'NOTE_LIKED',
                                payload: { noteId, userId }
                            })
                        }
                    }
                }
                break

            case 'NOTE_UNLIKED':
                if (channel.value) {
                    const { noteId, userId } = message.payload
                    const note = channel.value.notes.find(n => n.id === noteId)

                    if (note) {
                        const likeIndex = note.likes.indexOf(userId)
                        if (likeIndex !== -1) {
                            note.likes.splice(likeIndex, 1)
                            saveChannel(channel.value)

                            // Host ise diğer guest'lere broadcast et
                            if (getActiveRole() === 'host') {
                                doBroadcast({
                                    type: 'NOTE_UNLIKED',
                                    payload: { noteId, userId }
                                })
                            }
                        }
                    }
                }
                break
        }
    }

    // Storage event listener (aynı tarayıcıdaki farklı sekmeler için fallback)
    function setupStorageListener() {
        if (!import.meta.client) return

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === storageKey && e.newValue) {
                try {
                    channel.value = JSON.parse(e.newValue)
                } catch {
                    // Hata durumunda sessizce geç
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)

        // Cleanup
        onUnmounted(() => {
            window.removeEventListener('storage', handleStorageChange)
        })
    }

    // ID oluşturucu
    function generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Initialize
    onMounted(() => {
        channel.value = loadChannel()
        currentParticipant.value = loadParticipant()
        setupStorageListener()

        // Aktif provider'ın mesaj handler'ını kaydet
        if (activeProvider.value === 'trystero') {
            trystero.onMessage((message, peerId) => {
                handleWebRTCMessage(message as WebRTCMessage, { peer: peerId })
            })
        } else {
            webrtc.onMessage(handleWebRTCMessage)
        }
    })

    return {
        channel: channel,
        currentParticipant: currentParticipant,
        webrtcStatus: syncStatus,
        webrtcRole: syncRole,
        connectedPeersCount: connectedPeersCount,
        activeProvider: readonly(activeProvider),
        createChannel,
        initializeHost,
        joinChannel,
        createParticipant,
        addNote,
        updateNote,
        deleteNote,
        likeNote,
        unlikeNote,
        getNotesByColumn,
        loadChannel,
        loadParticipant
    }
}
