<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Join Modal -->
    <ParticipantJoin
      v-if="showJoinModal"
      :channel="channel"
      @join="handleJoin"
    />

    <!-- Export Modal -->
    <ExportModal
      v-if="showExportModal && channel"
      :channel="channel"
      @close="showExportModal = false"
      @copy="handleCopyMarkdown"
      @download="handleDownloadMarkdown"
    />

    <!-- Main Content -->
    <div v-else-if="channel || webrtcStatus === 'connecting' || webrtcStatus === 'connected'" class="w-full p-8 flex flex-col flex-1 overflow-hidden">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
              {{ channel?.name || 'Bağlanıyor...' }}
            </h1>
            <p class="text-gray-600">
              {{ channel?.isAnonymous ? '🎭 Anonim Mod' : '👤 İsimli Mod' }}
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Connection Status -->
            <ConnectionStatus
              :status="webrtcStatus"
              :role="webrtcRole"
              :connected-peers-count="connectedPeersCount"
            </ConnectionStatus>

            <!-- Presentation Mode Toggle -->
            <button
              @click="isPresentationMode = !isPresentationMode"
              class="h-10 px-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
              :title="isPresentationMode ? 'Sunum Modunu Kapat' : 'Sunum Modunu Aç'"
            >
              <span>{{ isPresentationMode ? '👁️ Sunum Modu' : '🎭 Normal Mod' }}</span>
            </button>

            <!-- Share Button -->
            <button
              @click="copyLink"
              class="h-10 px-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <span>{{ linkCopied ? '✓ Kopyalandı' : '🔗 Linki Paylaş' }}</span>
            </button>

            <!-- Export Button -->
            <button
              @click="openExportModal"
              class="h-10 px-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <span>📥 Export</span>
            </button>
          </div>
        </div>

        <!-- Participants -->
        <div v-if="channel" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-gray-600">Katılımcılar:</span>
          <div
            v-for="participant in channel.participants"
            :key="participant.id"
            class="px-3 py-1 rounded-full text-sm font-medium text-white"
            :style="{ backgroundColor: participant.color }"
          >
            {{ participant.name }}
          </div>
        </div>
      </div>

      <!-- Retro Board -->
      <RetroBoard
        v-if="channel"
        :channel="channel"
        :current-participant="currentParticipant"
        :is-presentation-mode="isPresentationMode"
        @add-note="handleAddNote"
        @update-note="handleUpdateNote"
        @delete-note="handleDeleteNote"
        @like-note="handleLikeNote"
        @unlike-note="handleUnlikeNote"
      />
      
      <!-- Connecting State -->
      <div v-else class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-700">Kanal verileri yükleniyor...</h2>
        <p class="text-gray-500 mt-2">Host ile bağlantı kuruluyor</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">🔍</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Kanal bulunamadı</h2>
        <p class="text-gray-600 mb-6">Bu retrospektif henüz oluşturulmamış veya host çevrimdışı olabilir.</p>
        <NuxtLink
          to="/"
          class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all inline-block"
        >
          Ana Sayfaya Dön
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProviderType } from '~/composables/useSyncProvider'

const route = useRoute()
const channelId = route.params.channelId as string

// Provider seçimini localStorage'dan oku
function getProviderFromSetup(): ProviderType {
  if (!import.meta.client) return 'trystero'
  
  // 1. URL Query Param'a bak (Guest linkinden gelenler için)
  const queryProvider = route.query.p as ProviderType
  if (queryProvider && ['peerjs', 'trystero', 'gun', 'supabase'].includes(queryProvider)) {
    return queryProvider
  }

  // 2. Setup verisine bak
  const setupData = localStorage.getItem(`retro_setup_${channelId}`)
  if (setupData) {
    try {
      const parsed = JSON.parse(setupData)
      return parsed.syncProvider || 'trystero'
    } catch {
      return 'trystero'
    }
  }
  
  // Sonra kanal verisine bak
  const channelData = localStorage.getItem(`retro_channel_${channelId}`)
  if (channelData) {
    try {
      const parsed = JSON.parse(channelData)
      return parsed.syncProvider || 'trystero'
    } catch {
      return 'trystero'
    }
  }
  
  return 'trystero'
}

const selectedProvider = getProviderFromSetup()
console.log('[DEBUG] Using sync provider:', selectedProvider)

// Supabase credential kontrolü (URL'den)
let supabaseOptions = {}
if (selectedProvider === 'supabase' && import.meta.client) {
  const credsStr = route.query.c as string
  if (credsStr) {
    try {
      const decoded = atob(credsStr)
      const creds = JSON.parse(decoded)
      console.log('[DEBUG] Found custom Supabase credentials in URL')
      supabaseOptions = {
        supabaseCredentials: {
          url: creds.u,
          key: creds.k
        }
      }
    } catch (e) {
      console.error('Failed to decode Supabase credentials:', e)
    }
  }
}

const {
  channel,
  currentParticipant,
  webrtcStatus,
  webrtcRole,
  connectedPeersCount,
  createChannel,
  initializeHost,
  joinChannel,
  createParticipant,
  addNote,
  updateNote,
  deleteNote,
  likeNote,
  unlikeNote,
  loadChannel,
  loadParticipant
} = useRetroChannel(channelId, selectedProvider, supabaseOptions)

const showJoinModal = ref(false)
const linkCopied = ref(false)
const isPresentationMode = ref(false)
const showExportModal = ref(false)

// Kanal yüklendiğinde (WebRTC sync sonrası) anonimlik kontrolü
// Kanal yüklendiğinde (WebRTC sync sonrası) anonimlik kontrolü
watch(channel, (newChannel) => {
  console.log('Channel watcher triggered:', newChannel ? newChannel.id : 'null')
  if (newChannel && !currentParticipant.value) {
    if (newChannel.isAnonymous) {
      // Anonim mod: Otomatik katıl (random isimle)
      console.log('Auto-joining anonymous channel')
      createParticipant('Anonymous') // İsim kullanılmayacak, random üretilecek
    } else {
      // İsimli mod: Modal göster
      console.log('Showing join modal for named channel')
      showJoinModal.value = true
    }
  }
})

onMounted(() => {
  console.log('Retro page mounted, channelId:', channelId)
  // Kanal var mı kontrol et (Host veya daha önce katılmış Guest)
  const existingChannel = loadChannel()
  const existingParticipant = loadParticipant()
  
  console.log('Initial load check - Channel:', existingChannel ? 'Found' : 'Not Found', 'Participant:', existingParticipant ? 'Found' : 'Not Found')
  
  if (existingChannel) {
    // Kanal var, katılımcı kontrolü
    if (!existingParticipant) {
      // Kanal var ama katılımcı yok (örn: localStorage temizlenmiş)
      // Bağlantı başlat, watch(channel) gerisini halledecek
      joinChannel()
    } else {
      // Mevcut katılımcı ile tekrar bağlan
      const participant = existingChannel.participants.find(p => p.id === existingParticipant.id)
      
      if (participant && participant.isCreator) {
        // Host ise - WebRTC mi yoksa localStorage sync mi?
        // Aynı tarayıcıda ikinci sekme açıldığında localStorage sync kullan
        initializeHost().catch((err) => {
          console.log('[DEBUG] Host initialization failed, falling back to localStorage sync mode')
          console.log('[DEBUG] Error was:', err.message)
          // WebRTC başarısız oldu ama channel verimiz localStorage'da var
          // Bunu manuel olarak yükle
          const localChannel = loadChannel()
          if (localChannel) {
            console.log('[DEBUG] Loaded channel from localStorage for sync mode:', localChannel.id)
            // channel reactive değişkeni useRetroChannel içinde, 
            // loadChannel() zaten channel.value'yu set ediyor
            // Ama emin olmak için tekrar yükleme yapalım
          }
        })
      } else {
        // Guest ise tekrar bağlan
        joinChannel()
      }
    }
  } else {
    // Kanal yok, yeni mi oluşturulacak yoksa guest mi?
    const setupData = localStorage.getItem(`retro_setup_${channelId}`)
    
    if (setupData) {
      // Yeni kanal oluştur (Host)
      const { name, isAnonymous, columns } = JSON.parse(setupData)
      createChannel(name, isAnonymous, columns)
      localStorage.removeItem(`retro_setup_${channelId}`)
    } else {
      // Guest olarak katılacak, bağlantı başlat
      joinChannel()
    }
  }
})

function handleJoin(name: string) {
  createParticipant(name)
  showJoinModal.value = false
}

function handleAddNote(columnId: string, content: string) {
  addNote(columnId, content)
}

function handleUpdateNote(noteId: string, content: string) {
  updateNote(noteId, content)
}

function handleDeleteNote(noteId: string) {
  deleteNote(noteId)
}

function handleLikeNote(noteId: string) {
  likeNote(noteId)
}

function handleUnlikeNote(noteId: string) {
  unlikeNote(noteId)
}

function copyLink() {
  if (import.meta.client) {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  }
}

function openExportModal() {
  if (!channel.value) return
  showExportModal.value = true
}

function handleCopyMarkdown(markdown: string) {
  if (!import.meta.client) return
  navigator.clipboard.writeText(markdown)
}

function handleDownloadMarkdown(markdown: string) {
  if (!import.meta.client || !channel.value) return

  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${channel.value.name.replace(/\s+/g, '_')}_${Date.now()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
