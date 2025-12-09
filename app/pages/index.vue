<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-2xl w-full">
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          RetroRTC
        </h1>
        <p class="text-xl text-gray-600">
          Takımınız için anonim retrospektif aracı
        </p>
      </div>

      <!-- Kanal Oluşturma Formu -->
      <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-up">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Yeni Retrospektif Oluştur</h2>
        
        <form @submit.prevent="createRetro" class="space-y-6">
          <!-- Kanal Adı -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Retrospektif Adı
            </label>
            <input
              v-model="channelName"
              type="text"
              placeholder="Örn: Sprint 24 Retrospektifi"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>

          <!-- Mod Seçimi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Katılımcı Modu
            </label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="isAnonymous = true"
                :class="[
                  'p-4 rounded-xl border-2 transition-all',
                  isAnonymous
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300'
                ]"
              >
                <div class="text-3xl mb-2">🎭</div>
                <div class="font-semibold text-gray-800">Anonim</div>
                <div class="text-xs text-gray-500 mt-1">Rastgele takma isimler</div>
              </button>
              
              <button
                type="button"
                @click="isAnonymous = false"
                :class="[
                  'p-4 rounded-xl border-2 transition-all',
                  !isAnonymous
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300'
                ]"
              >
                <div class="text-3xl mb-2">👤</div>
                <div class="font-semibold text-gray-800">İsimli</div>
                <div class="text-xs text-gray-500 mt-1">Gerçek isimler görünsün</div>
              </button>
            </div>
          </div>

          <!-- Kolonlar -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Kolonlar
            </label>
            <div class="space-y-2 mb-3">
              <div
                v-for="(column, index) in columns"
                :key="index"
                class="flex gap-2"
              >
                <input
                  v-model="columns[index]"
                  type="text"
                  placeholder="Kolon adı"
                  class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  required
                />
                <button
                  v-if="columns.length > 1"
                  type="button"
                  @click="removeColumn(index)"
                  class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <button
              type="button"
              @click="addColumn"
              class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-all"
            >
              + Kolon Ekle
            </button>
          </div>

          <!-- Bağlantı Yöntemi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Bağlantı Yöntemi
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="provider in providers"
                :key="provider.id"
                type="button"
                @click="syncProvider = provider.id"
                :class="[
                  'p-3 rounded-xl border-2 transition-all text-center',
                  syncProvider === provider.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300'
                ]"
              >
                <div class="text-2xl mb-1">{{ provider.icon }}</div>
                <div class="font-semibold text-gray-800 text-sm">{{ provider.name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ provider.description }}</div>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
          >
            Retrospektif Oluştur 🚀
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-gray-500 text-sm">
        <p>Backend gerektirmez • Tüm veriler tarayıcınızda saklanır</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProviderType } from '~/composables/useSyncProvider'
import { PROVIDER_INFO } from '~/composables/useSyncProvider'

const router = useRouter()

const channelName = ref('')
const isAnonymous = ref(true)
const columns = ref(['İyi Gidenler', 'Geliştirilmesi Gerekenler', 'Aksiyon Maddeleri'])
const syncProvider = ref<ProviderType>('trystero') // Varsayılan: Trystero

// Provider listesi
const providers = computed(() => [
  { id: 'peerjs' as ProviderType, ...PROVIDER_INFO.peerjs },
  { id: 'trystero' as ProviderType, ...PROVIDER_INFO.trystero },
  { id: 'gun' as ProviderType, ...PROVIDER_INFO.gun }
])

function addColumn() {
  columns.value.push('')
}

function removeColumn(index: number) {
  columns.value.splice(index, 1)
}

function createRetro() {
  // Benzersiz kanal ID oluştur
  const channelId = generateChannelId()
  
  // Kanal bilgilerini localStorage'a kaydet (geçici olarak)
  if (process.client) {
    const channelData = {
      name: channelName.value,
      isAnonymous: isAnonymous.value,
      columns: columns.value.filter(c => c.trim() !== ''),
      syncProvider: syncProvider.value // Provider seçimini kaydet
    }
    localStorage.setItem(`retro_setup_${channelId}`, JSON.stringify(channelData))
  }
  
  // Retrospektif sayfasına yönlendir
  router.push(`/retro/${channelId}`)
}

function generateChannelId(): string {
  return Math.random().toString(36).substring(2, 10)
}
</script>
