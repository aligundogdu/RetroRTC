<template>
  <div class="min-h-screen flex items-center justify-center p-6 relative">
    <!-- Language Switcher -->
    <div class="absolute top-6 right-6 flex gap-2">
        <button 
            @click="setLocale('tr')" 
            class="px-3 py-1 rounded transition-colors"
            :class="locale === 'tr' ? 'bg-purple-100 text-purple-700 font-bold' : 'text-gray-500 hover:text-gray-700'"
        >TR</button>
        <div class="w-px bg-gray-300 h-6 my-auto"></div>
        <button 
            @click="setLocale('en')" 
            class="px-3 py-1 rounded transition-colors"
            :class="locale === 'en' ? 'bg-purple-100 text-purple-700 font-bold' : 'text-gray-500 hover:text-gray-700'"
        >EN</button>
    </div>

    <div class="max-w-2xl w-full">
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {{ t('home.title') }}
        </h1>
        <p class="text-xl text-gray-600">
          {{ t('home.subtitle') }}
        </p>
      </div>

      <!-- Kanal Oluşturma Formu -->
      <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-up">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ t('home.form.title') }}</h2>
        
        <form @submit.prevent="createRetro" class="space-y-6">
          <!-- Kanal Adı -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('home.form.name_label') }}
            </label>
            <input
              v-model="channelName"
              type="text"
              :placeholder="t('home.form.name_placeholder')"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>

          <!-- Mod Seçimi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              {{ t('home.form.mode_label') }}
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
                <div class="font-semibold text-gray-800">{{ t('home.form.mode_anonymous') }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ t('home.form.mode_anonymous_desc') }}</div>
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
                <div class="font-semibold text-gray-800">{{ t('home.form.mode_named') }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ t('home.form.mode_named_desc') }}</div>
              </button>
            </div>
          </div>

          <!-- Kolonlar -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              {{ t('home.form.columns_label') }}
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
                  :placeholder="t('home.form.column_placeholder')"
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
              {{ t('home.form.add_column') }}
            </button>
          </div>

          <!-- Bağlantı Yöntemi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              {{ t('home.form.connection_label') }}
            </label>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

          <!-- Supabase Custom Credentials -->
          <div v-if="syncProvider === 'supabase'" class="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in">
            <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>{{ t('home.supabase.title') }}</span>
              <span class="text-xs font-normal text-gray-500">{{ t('home.supabase.subtitle') }}</span>
            </h3>
            
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">{{ t('home.supabase.url_label') }}</label>
                <input
                  v-model="supabaseUrl"
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">{{ t('home.supabase.key_label') }}</label>
                <input
                  v-model="supabaseKey"
                  type="password"
                  placeholder="public-anon-key..."
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div class="mt-3 text-xs text-amber-600 flex gap-2">
              <span>⚠️</span>
              <p>{{ t('home.supabase.warning') }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
          >
            {{ t('home.form.submit') }}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-gray-500 text-sm">
        <p>{{ t('home.form.footer') }}</p>
        
        <!-- Import Backup -->
        <div class="mt-4 pt-4 border-t border-gray-200/50">
            <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-purple-600 transition-colors">
                <span>📂</span>
                <span>{{ t('home.import_backup') }}</span>
                <input 
                    type="file" 
                    accept=".json"
                    class="hidden"
                    @change="handleImportBackup"
                />
            </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProviderType } from '~/composables/useSyncProvider'
import { PROVIDER_INFO } from '~/composables/useSyncProvider'
import { useTranslation } from '~/composables/useTranslation'
import type { RetroChannel } from '~/composables/useRetroChannel'

const { t, locale, setLocale } = useTranslation()
const router = useRouter()

const channelName = ref('')
const isAnonymous = ref(true)
const columns = ref(['İyi Gidenler', 'Geliştirilmesi Gerekenler', 'Aksiyon Maddeleri'])
const syncProvider = ref<ProviderType>('trystero') // Varsayılan: Trystero

// Provider listesi
const providers = computed(() => [
  { id: 'peerjs' as ProviderType, ...PROVIDER_INFO.peerjs, description: t('providers.peerjs.description') },
  { id: 'trystero' as ProviderType, ...PROVIDER_INFO.trystero, description: t('providers.trystero.description') },
  { id: 'gun' as ProviderType, ...PROVIDER_INFO.gun, description: t('providers.gun.description') },
  { id: 'supabase' as ProviderType, ...PROVIDER_INFO.supabase, description: t('providers.supabase.description') }
])

const supabaseUrl = ref('')
const supabaseKey = ref('')

// Pre-fill from config if available (only on client to avoid hydration mismatch if env differs)
onMounted(() => {
  const config = useRuntimeConfig()
  if (config.public.supabaseUrl) supabaseUrl.value = config.public.supabaseUrl as string
  if (config.public.supabaseKey) supabaseKey.value = config.public.supabaseKey as string
})

function addColumn() {
  columns.value.push('')
}

function removeColumn(index: number) {
  columns.value.splice(index, 1)
}

function handleImportBackup(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
        try {
            const json = e.target?.result as string
            const backup: RetroChannel = JSON.parse(json)

            // Validate structure loosely
            if (!backup.id || !backup.name || !Array.isArray(backup.columns) || !Array.isArray(backup.notes)) {
                alert('Invalid backup file format')
                return
            }

            // Generate NEW ID for the imported channel to act as a "migration" into a fresh room
            const newChannelId = generateChannelId()

            // Construct new channel data
            const newChannelData: RetroChannel = {
                ...backup,
                id: newChannelId, // Override ID
                participants: [], // Reset participants for clean slate (Host will join automatically)
                // Use selected sync provider from UI or keep from backup?
                // Better to respect UI selection since user might want to switch providers during migration
                // But wait, the user selects provider BEFORE import?
                // The import button is separate.
                // Let's use the UI default (Trystero) OR try to detect.
                // Actually, let's keep the user's current selection from the form if they made one, OR default.
                // We'll update the syncProvider in the backup to match what's in the form logic below?
                // No, simpler: Just use what's in the backup?
                // If the backup has 'supabase', maybe they want to keep it.
                // But if they are migrating BECAUSE of provider issues, they likely want to change it.
                // Let's use the `syncProvider.value` from the form (which defaults to Trystero).
            }

            // But wait, `createRetro` below sets `syncProvider` based on the dropdown.
            // If the user hasn't touched the dropdown, it's Trystero.
            // Let's stick with that.
            
            // Save to localStorage
            if (process.client) {
                // Save channel data directly
                localStorage.setItem(`retro_channel_${newChannelId}`, JSON.stringify(newChannelData))
                
                // Also create and save the Setup data so `retro/[id].vue` knows what provider to use
                // logic in `getProviderFromSetup` checks `retro_setup_ID` or `retro_channel_ID`
                // But `retro_channel` has it inside usually? No, `RetroChannel` interface doesn't strictly have `syncProvider` field by default in the interface definition?
                // Let's check RetroChannel interface...
                // It is defined in useRetroChannel.ts.
                
                // Let's assume we need to save setup data too for provider consistency
                 const channelData = {
                    name: newChannelData.name,
                    isAnonymous: newChannelData.isAnonymous,
                    columns: newChannelData.columns.map(c => c.name), // Setup expects string[]
                    syncProvider: syncProvider.value // Use the current dropdown value!
                }
                localStorage.setItem(`retro_setup_${newChannelId}`, JSON.stringify(channelData))
                
                // Create local participant as Host/Creator
                // Use a default name or "Host"
                // Actually `[channelId].vue` handles creation if not found.
                // But we want to claim "Creator" status.
                // If we let `[channelId].vue` auto-create, it might just join as guest?
                // No, it checks `localStorage`.
                // Let's just navigate. `[channelId].vue` will see `retro_channel_ID` exists.
                // It calls `loadChannel`.
                // Then `initializeHost` needs to be called.
                // `onMounted` logic:
                // if (existingChannel) { if (!existingParticipant) { joinChannel() } }
                // `joinChannel` will add us as a participant.
                // We need to be the HOST.
                
                // WORKAROUND: We manually create the participant here and save it.
                const hostId = Math.random().toString(36).substring(2, 9)
                const hostPart = {
                    id: hostId,
                    name: 'Host (Admin)', // Default name
                    isCreator: true,
                    color: '#8B5CF6', // Purple
                    joinedAt: Date.now()
                }
                localStorage.setItem(`retro_participant_${newChannelId}`, JSON.stringify(hostPart))
                
                // Also add this participant to the channel data we just saved!
                newChannelData.participants = [hostPart]
                localStorage.setItem(`retro_channel_${newChannelId}`, JSON.stringify(newChannelData))
            }

            // Construct query
             const query: any = { p: syncProvider.value }
             if (syncProvider.value === 'supabase' && supabaseUrl.value && supabaseKey.value) {
                const creds = JSON.stringify({ u: supabaseUrl.value, k: supabaseKey.value })
                query.c = btoa(creds)
            }

            // Redirect
             router.push({
                path: `/retro/${newChannelId}`,
                query
            })
        } catch (err) {
            console.error(err)
            alert('Failed to parse backup file')
        }
    }
    if (file) {
        reader.readAsText(file)
    }
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
  
  const query: any = { p: syncProvider.value }

  // Supabase özel credentials varsa ekle
  if (syncProvider.value === 'supabase' && supabaseUrl.value && supabaseKey.value) {
    // Base64 encode basic obfuscation
    const creds = JSON.stringify({ u: supabaseUrl.value, k: supabaseKey.value })
    query.c = btoa(creds)
  }

  // Retrospektif sayfasına yönlendir
  router.push({
    path: `/retro/${channelId}`,
    query
  })
}

function generateChannelId(): string {
  return Math.random().toString(36).substring(2, 10)
}
</script>
