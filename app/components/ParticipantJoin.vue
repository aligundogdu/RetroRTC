<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-slide-up">
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">👋</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          Retrospektife Hoş Geldiniz!
        </h2>
        <p class="text-gray-600">
          {{ channel?.name }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!channel?.isAnonymous">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Adınız Soyadınız
          </label>
          <input
            v-model="participantName"
            type="text"
            placeholder="Örn: Ahmet Yılmaz"
            class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
            required
          />
        </div>

        <div v-else class="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p class="text-sm text-gray-600 mb-2">Sizin takma isminiz:</p>
          <p class="text-xl font-bold text-purple-600">
            {{ randomNickname }}
          </p>
        </div>

        <button
          type="submit"
          class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
        >
          Katıl 🚀
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RetroChannel } from '~/composables/useRetroChannel'

const props = defineProps<{
  channel: RetroChannel | null
}>()

const emit = defineEmits<{
  join: [name: string]
}>()

const participantName = ref('')
const randomNickname = ref('')

onMounted(() => {
  if (props.channel?.isAnonymous) {
    randomNickname.value = generateRandomNickname()
  }
})

function handleSubmit() {
  const name = props.channel?.isAnonymous ? randomNickname.value : participantName.value
  emit('join', name)
}
</script>
