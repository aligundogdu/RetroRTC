<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.self="$emit('close')">
    <div 
      class="bg-white rounded-xl shadow-xl overflow-hidden"
      style="width: 75%; height: 90vh; display: flex; flex-direction: column;"
    >
      <!-- Header -->
      <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0;">Export Al</h2>
        <div style="display: flex; align-items: center; gap: 16px;">
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: #4b5563; user-select: none;">
            <input v-model="includeLikes" type="checkbox" style="cursor: pointer; accent-color: #7c3aed;">
            Beğenileri Dahil Et
          </label>
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: #4b5563; user-select: none;">
            <input v-model="includeAuthors" type="checkbox" style="cursor: pointer; accent-color: #7c3aed;">
            Yazarları Dahil Et
          </label>
          <button @click="$emit('close')" style="background: none; border: none; font-size: 24px; color: #9ca3af; cursor: pointer; line-height: 1; margin-left: 8px;">×</button>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div style="flex: 1; overflow-y: auto; margin: 10px;">
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; min-height: 100%; position: relative;">
          <button 
            @click="handleCopy" 
            style="position: absolute; top: 8px; right: 8px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
            :title="copied ? 'Kopyalandı' : 'Kopyala'"
          >
            <span v-if="copied" style="font-size: 16px;">✅</span>
            <span v-else style="font-size: 16px;">📋</span>
          </button>
          <pre style="font-size: 14px; font-family: monospace; color: #1f2937; white-space: pre-wrap; margin: 0; padding-right: 30px;">{{ markdownContent }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RetroChannel } from '~/composables/useRetroChannel'

const props = defineProps<{
  channel: RetroChannel
}>()

const emit = defineEmits<{
  close: []
  copy: [markdown: string]
  download: [markdown: string]
}>()

const includeLikes = ref(true)
const includeAuthors = ref(true)
const copied = ref(false)

const markdownContent = computed(() => {
  let markdown = `# ${props.channel.name}\n\n`

  const sortedColumns = [...props.channel.columns].sort((a, b) => a.order - b.order)

  sortedColumns.forEach(column => {
    markdown += `## ${column.name}\n\n`
    const columnNotes = props.channel.notes.filter(note => note.columnId === column.id)

    if (columnNotes.length === 0) {
      markdown += `_Henüz not eklenmemiş_\n\n`
    } else {
      columnNotes.forEach(note => {
        markdown += `- ${note.content}`
        if (includeLikes.value && note.likes.length > 0) {
          markdown += ` (❤️ ${note.likes.length})`
        }
        if (includeAuthors.value && note.authorName) {
          markdown += ` - ${note.authorName}`
        }
        markdown += `\n`
      })
      markdown += `\n`
    }
  })

  return markdown
})

function handleCopy() {
  emit('copy', markdownContent.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
