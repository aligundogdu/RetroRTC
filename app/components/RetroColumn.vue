<template>
  <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 h-fit">
    <!-- Column Header -->
    <div class="mb-4 pb-4 border-b border-gray-200">
      <h3 class="text-xl font-bold text-gray-800">
        {{ column.name }}
      </h3>
      <p class="text-sm text-gray-500 mt-1">
        {{ notes.length }} {{ t('retro.notes') }}
      </p>
    </div>

    <!-- Add Note Button -->
    <button
      v-if="!isPresentationMode"
      @click="showAddNote = true"
      class="w-full mb-4 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
    >
      {{ t('retro.add_note') }}
    </button>

    <!-- Add Note Form -->
    <div v-if="showAddNote" class="mb-4 animate-slide-up">
      <textarea
        v-model="newNoteContent"
        :placeholder="t('retro.add_note_placeholder')"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
        rows="3"
        @keydown.enter.ctrl="addNote"
      />
      <div class="flex gap-2 mt-2">
        <button
          @click="addNote"
          class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {{ t('retro.add') }}
        </button>
        <button
          @click="cancelAdd"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {{ t('retro.cancel') }}
        </button>
      </div>
    </div>

    <!-- Notes List -->
    <div class="space-y-3">
      <PostItNote
        v-for="note in notes"
        :key="note.id"
        :note="note"
        :can-edit="currentParticipant?.id === note.authorId"
        :current-participant-id="currentParticipant?.id ?? null"
        :is-presentation-mode="isPresentationMode"
        @update="(content) => $emit('update-note', note.id, content)"
        @delete="$emit('delete-note', note.id)"
        @like="$emit('like-note', note.id)"
        @unlike="$emit('unlike-note', note.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Column, PostItNote, Participant } from '~/composables/useRetroChannel'
import { useTranslation } from '~/composables/useTranslation'

const { t } = useTranslation()

const props = defineProps<{
  column: Column
  notes: PostItNote[]
  currentParticipant: Participant | null
  isPresentationMode: boolean
}>()

const emit = defineEmits<{
  'add-note': [content: string]
  'update-note': [noteId: string, content: string]
  'delete-note': [noteId: string]
  'like-note': [noteId: string]
  'unlike-note': [noteId: string]
}>()

const showAddNote = ref(false)
const newNoteContent = ref('')

function addNote() {
  if (newNoteContent.value.trim()) {
    emit('add-note', newNoteContent.value.trim())
    newNoteContent.value = ''
    showAddNote.value = false
  }
}

function cancelAdd() {
  newNoteContent.value = ''
  showAddNote.value = false
}
</script>
