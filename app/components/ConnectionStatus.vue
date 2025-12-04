<template>
  <div class="h-10 flex items-center gap-3 px-4 bg-white rounded-xl shadow-md">
    <!-- Status Indicator -->
    <div class="flex items-center gap-2">
      <div 
        class="w-3 h-3 rounded-full transition-all"
        :class="{
          'bg-green-500 animate-pulse': status === 'connected',
          'bg-yellow-500 animate-pulse': status === 'connecting',
          'bg-red-500': status === 'disconnected' || status === 'error'
        }"
      />
      <span class="text-sm font-medium text-gray-700">
        {{ statusText }}
      </span>
    </div>

    <!-- Role Badge -->
    <div 
      v-if="role"
      class="px-3 py-1 rounded-full text-xs font-semibold"
      :class="{
        'bg-purple-100 text-purple-700': role === 'host',
        'bg-blue-100 text-blue-700': role === 'guest'
      }"
    >
      {{ role === 'host' ? '👑 Host' : '👤 Guest' }}
    </div>

    <!-- Connected Peers Count -->
    <div 
      v-if="role === 'host' && connectedPeersCount > 0"
      class="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700"
    >
      {{ connectedPeersCount }} katılımcı bağlı
    </div>

    <!-- Error Message -->
    <div 
      v-if="error"
      class="text-xs text-red-600 max-w-xs truncate"
      :title="error"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConnectionStatus, PeerRole } from '~/composables/useWebRTC'

const props = defineProps<{
  status: ConnectionStatus
  role: PeerRole
  connectedPeersCount: number
  error?: string | null
}>()

const statusText = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'Bağlı'
    case 'connecting':
      return 'Bağlanıyor...'
    case 'disconnected':
      return 'Bağlantı Yok'
    case 'error':
      return 'Hata'
    default:
      return 'Bilinmiyor'
  }
})
</script>
