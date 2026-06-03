<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ image: string | boolean | null }>()
const emit = defineEmits<{ update: [string | null] }>()
const input = ref<HTMLInputElement | null>(null)
const over = ref(false)
const loading = ref(false)

function pick() { input.value?.click() }

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  ;(e.target as HTMLInputElement).value = ''

  loading.value = true
  const r = new FileReader()
  r.onload = () => {
    emit('update', r.result as string)
    loading.value = false
  }
  r.onerror = () => { loading.value = false }
  r.readAsDataURL(f)
}

function onDrop(e: DragEvent) {
  e.preventDefault(); over.value = false
  const f = e.dataTransfer?.files?.[0]
  if (!f?.type.startsWith('image/')) return

  loading.value = true
  const r = new FileReader()
  r.onload = () => {
    emit('update', r.result as string)
    loading.value = false
  }
  r.onerror = () => { loading.value = false }
  r.readAsDataURL(f)
}

function remove(e: MouseEvent) {
  e.stopPropagation()
  emit('update', null)
}
</script>

<template>
  <div
    :class="['img-cell', { 'has-img': !!image, over }]"
    @click="pick"
    @drop="onDrop"
    @dragover.prevent="over = true"
    @dragleave="over = false"
    :title="image ? '替换图片' : '上传画面'"
  >
    <input ref="input" type="file" accept="image/*" hidden @change="onFile" />

    <!-- 从 IndexedDB 异步加载中 -->
    <div v-if="image === true" class="img-loading">
      <span class="spinner"></span>
    </div>

    <!-- 上传中 -->
    <div v-else-if="loading" class="img-loading">
      <span class="spinner"></span>
    </div>

    <template v-else>
      <img v-if="image" :src="image as string" alt="" class="img-preview" />
      <div v-else class="img-placeholder">
        <span class="ip-icon">+</span>
      </div>
    </template>

    <button v-if="image && image !== true" class="img-remove" @click="remove">✕</button>
  </div>
</template>

<style scoped>
.img-cell {
  width: 88px;
  height: 48px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  background: var(--bg-hover);
  border: 1.5px dashed #cbd5e1;
  transition: all 0.15s;
}

.img-cell:hover { border-color: var(--accent); }
.img-cell.over { border-color: var(--accent); background: var(--accent-light); }
.img-cell.has-img { border-style: solid; border-color: var(--border); background: #fff; }

.img-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ip-icon {
  font-size: 20px;
  font-weight: 300;
  color: #94a3b8;
  line-height: 1;
}

.img-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #e2e8f0;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.img-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-size: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.img-cell:hover .img-remove { opacity: 1; }
</style>
