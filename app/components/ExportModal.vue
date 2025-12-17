<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.self="$emit('close')">
    <div 
      class="bg-white rounded-xl shadow-xl overflow-hidden"
      style="width: 75%; height: 90vh; display: flex; flex-direction: column;"
    >
      <!-- Header -->
      <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0;">{{ t('retro.export_modal.title') }}</h2>
        <div style="display: flex; align-items: center; gap: 16px;">
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: #4b5563; user-select: none;">
            <input v-model="includeLikes" type="checkbox" style="cursor: pointer; accent-color: #7c3aed;">
            {{ t('retro.export_modal.include_likes') }}
          </label>
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: #4b5563; user-select: none;">
            <input v-model="includeAuthors" type="checkbox" style="cursor: pointer; accent-color: #7c3aed;">
            {{ t('retro.export_modal.include_authors') }}
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
            :title="copied ? t('retro.export_modal.copied') : t('retro.export_modal.copy')"
          >
            <span v-if="copied" style="font-size: 16px;">✅</span>
            <span v-else style="font-size: 16px;">📋</span>
          </button>
          <pre style="font-size: 14px; font-family: monospace; color: #1f2937; white-space: pre-wrap; margin: 0; padding-right: 30px;">{{ markdownContent }}</pre>
        </div>

        <!-- Technical Backup Section -->
        <div style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #4b5563; margin-bottom: 8px;">{{ t('retro.export_modal.json_backup_title') }}</h3>
            <button 
                @click="handleDownloadJson"
                style="background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 16px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;"
                onmouseover="this.style.backgroundColor='#e5e7eb'"
                onmouseout="this.style.backgroundColor='#f3f4f6'"
            >
                <span>📦</span>
                {{ t('retro.export_modal.download_json') }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RetroChannel } from '~/composables/useRetroChannel'
import { useTranslation } from '~/composables/useTranslation'

const { t } = useTranslation()

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
      markdown += `${t('retro.export_modal.no_notes')}\n\n`
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

function handleDownloadJson() {
    if (!import.meta.client || !props.channel) return

    const jsonString = JSON.stringify(props.channel, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // sanitized name + timestamp
    const safeName = props.channel.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    a.download = `retro_backup_${safeName}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
</script>
