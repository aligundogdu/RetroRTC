<template>
  <div class="grid gap-6" :style="gridStyle">
    <RetroColumn
      v-for="column in channel.columns"
      :key="column.id"
      :column="column"
      :notes="getNotesByColumn(column.id)"
      :current-participant="currentParticipant"
      :is-presentation-mode="isPresentationMode"
      @add-note="(content) => $emit('add-note', column.id, content)"
      @update-note="(noteId, content) => $emit('update-note', noteId, content)"
      @delete-note="(noteId) => $emit('delete-note', noteId)"
      @like-note="(noteId) => $emit('like-note', noteId)"
      @unlike-note="(noteId) => $emit('unlike-note', noteId)"
    />
  </div>
</template>

<script setup lang="ts">
import type { RetroChannel, Participant, PostItNote } from '~/composables/useRetroChannel'

const props = defineProps<{
  channel: RetroChannel
  currentParticipant: Participant | null
  isPresentationMode: boolean
}>()

const emit = defineEmits<{
  'add-note': [columnId: string, content: string]
  'update-note': [noteId: string, content: string]
  'delete-note': [noteId: string]
  'like-note': [noteId: string]
  'unlike-note': [noteId: string]
}>()

const gridStyle = computed(() => {
  const columnCount = props.channel.columns.length
  return {
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
  }
})

function getNotesByColumn(columnId: string): PostItNote[] {
  return props.channel.notes.filter(note => note.columnId === columnId)
}
</script>
