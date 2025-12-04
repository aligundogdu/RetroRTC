<template>
  <div
    :class="[
      'p-4 rounded-xl shadow-md hover:shadow-lg transition-transform duration-200 ease-out transform hover:scale-[1.02] animate-fade-in overflow-hidden',
      note.color
    ]"
  >
    <div v-if="!isEditing">
      <p class="text-gray-800 whitespace-pre-wrap break-words mb-3">
        {{ note.content }}
      </p>
      
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: getAuthorColor() }"
            />
            <span class="text-gray-600 font-medium">{{ note.authorName }}</span>
          </div>
          
          <!-- Like Button -->
          <button
            @click="toggleLike"
            class="flex items-center gap-1 px-2 py-1 bg-white/50 rounded hover:bg-white/80 transition-colors"
            :title="isLiked ? 'Beğeniyi Kaldır' : 'Beğen'"
          >
            <span :class="isLiked ? 'text-red-500' : 'text-gray-400'">{{ isLiked ? '❤️' : '🤍' }}</span>
            <span class="text-gray-600 font-medium">{{ note.likes.length }}</span>
          </button>
        </div>
        
        <div v-if="canEdit && !isPresentationMode" class="flex gap-2">
          <button
            @click="startEdit"
            class="px-2 py-1 bg-white/50 rounded hover:bg-white/80 transition-colors"
            title="Düzenle"
          >
            ✏️
          </button>
          <button
            @click="confirmDelete"
            class="px-2 py-1 bg-white/50 rounded hover:bg-white/80 transition-colors"
            title="Sil"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else>
      <textarea
        v-model="editContent"
        class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none bg-white/80"
        rows="3"
        @keydown.enter.ctrl="saveEdit"
      />
      <div class="flex gap-2 mt-2">
        <button
          @click="saveEdit"
          class="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          Kaydet
        </button>
        <button
          @click="cancelEdit"
          class="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
        >
          İptal
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostItNote } from '~/composables/useRetroChannel'

const props = defineProps<{
  note: PostItNote
  canEdit: boolean
  currentParticipantId: string | null
  isPresentationMode: boolean
}>()

const emit = defineEmits<{
  update: [content: string]
  delete: []
  like: []
  unlike: []
}>()

const isEditing = ref(false)
const editContent = ref('')

const isLiked = computed(() => {
  if (!props.currentParticipantId) return false
  return props.note.likes.includes(props.currentParticipantId)
})

function toggleLike() {
  if (isLiked.value) {
    emit('unlike')
  } else {
    emit('like')
  }
}

function startEdit() {
  editContent.value = props.note.content
  isEditing.value = true
}

function saveEdit() {
  if (editContent.value.trim()) {
    emit('update', editContent.value.trim())
    isEditing.value = false
  }
}

function cancelEdit() {
  isEditing.value = false
  editContent.value = ''
}

function confirmDelete() {
  if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
    emit('delete')
  }
}

function getAuthorColor(): string {
  // Bu fonksiyon için channel'dan participant rengini almamız gerekir
  // Şimdilik basit bir hash fonksiyonu kullanıyoruz
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ]
  const hash = props.note.authorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length] || '#FF6B6B'
}
</script>
