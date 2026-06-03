<script setup lang="ts">
import { state, updateShot, removeShot } from '../stores/index'
import type { Shot } from '../types'
import RichCell from './RichCell.vue'
import ImageCell from './ImageCell.vue'

const props = defineProps<{
  shot: Shot
  dragging: boolean
  dragOver: boolean
  selected: boolean
}>()

const emit = defineEmits<{
  dragStart: [string]
  dragOver: [DragEvent, string]
  dragLeave: [string]
  drop: [string]
  toggleSelect: [string]
}>()
</script>

<template>
  <div
    :class="['shot-row', {
      dragging,
      'drag-over': dragOver,
      selected: selected && state.batch,
      batch: state.batch,
    }]"
    draggable="true"
    @dragstart="(e) => {
      // 只有从排序列（⠿手柄）拖拽才生效
      const handle = (e.target as HTMLElement).closest('.s-sort')
      if (!handle) { e.preventDefault(); return }
      e.dataTransfer!.effectAllowed = 'move'
      e.dataTransfer!.setData('text/plain', shot.id)
      emit('dragStart', shot.id)
    }"
    @dragover="(e) => emit('dragOver', e, shot.id)"
    @dragleave="emit('dragLeave', shot.id)"
    @drop="emit('drop', shot.id)"
    @dragend="emit('drop', '')"
  >
    <!-- 排序 -->
    <div
      v-if="state.cols.find(c => c.key === 'sort')?.visible"
      class="s-cell s-sort"
      :style="{ width: state.cols.find(c => c.key === 'sort')?.width + 'px' }"
    >
      <span class="row-handle">⠿</span>
      <span class="row-order">{{ shot.order }}</span>
    </div>

    <!-- 镜号 -->
    <div
      v-if="state.cols.find(c => c.key === 'number')?.visible"
      class="s-cell s-num"
      :style="{ width: state.cols.find(c => c.key === 'number')?.width + 'px' }"
    >
      <span class="shot-num">{{ shot.number }}</span>
    </div>

    <!-- 画面 -->
    <div
      v-if="state.cols.find(c => c.key === 'image')?.visible"
      class="s-cell s-img"
      :style="{ width: state.cols.find(c => c.key === 'image')?.width + 'px' }"
    >
      <ImageCell :image="shot.image" @update="(v) => updateShot(shot.id, { image: v })" />
    </div>

    <!-- 景别 -->
    <div
      v-if="state.cols.find(c => c.key === 'frame')?.visible"
      class="s-cell s-text"
      :style="{ width: state.cols.find(c => c.key === 'frame')?.width + 'px' }"
    >
      <RichCell :modelValue="shot.frame" @update:modelValue="(v) => updateShot(shot.id, { frame: String(v) })" />
    </div>

    <!-- 时长 -->
    <div
      v-if="state.cols.find(c => c.key === 'duration')?.visible"
      class="s-cell s-text"
      :style="{ width: state.cols.find(c => c.key === 'duration')?.width + 'px' }"
    >
      <RichCell :modelValue="shot.duration" type="number" @update:modelValue="(v) => updateShot(shot.id, { duration: Number(v) })" />
    </div>

    <!-- 内容 -->
    <div
      v-if="state.cols.find(c => c.key === 'content')?.visible"
      class="s-cell s-text s-content"
      :style="{ width: state.cols.find(c => c.key === 'content')?.width + 'px' }"
    >
      <RichCell :modelValue="shot.content" rich @update:modelValue="(v) => updateShot(shot.id, { content: String(v) })" />
    </div>

    <!-- 备注 -->
    <div
      v-if="state.cols.find(c => c.key === 'notes')?.visible"
      class="s-cell s-text"
      :style="{ width: state.cols.find(c => c.key === 'notes')?.width + 'px' }"
    >
      <RichCell :modelValue="shot.notes" rich @update:modelValue="(v) => updateShot(shot.id, { notes: String(v) })" />
    </div>

    <!-- 参考 -->
    <div
      v-if="state.cols.find(c => c.key === 'reference')?.visible"
      class="s-cell s-text"
      :style="{ width: state.cols.find(c => c.key === 'reference')?.width + 'px' }"
    >
      <RichCell :modelValue="shot.reference" rich @update:modelValue="(v) => updateShot(shot.id, { reference: String(v) })" />
    </div>

    <!-- 场景预期 -->
    <div
      v-if="state.cols.find(c => c.key === 'sceneExpect')?.visible"
      class="s-cell s-text"
      :style="{ width: state.cols.find(c => c.key === 'sceneExpect')?.width + 'px' }"
    >
      <RichCell :modelValue="shot.sceneExpect" rich @update:modelValue="(v) => updateShot(shot.id, { sceneExpect: String(v) })" />
    </div>

    <!-- 声音 -->
    <div
      v-if="state.cols.find(c => c.key === 'sound')?.visible"
      class="s-cell s-text"
      :style="{ width: state.cols.find(c => c.key === 'sound')?.width + 'px' }"
    >
      <RichCell :modelValue="shot.sound" rich @update:modelValue="(v) => updateShot(shot.id, { sound: String(v) })" />
    </div>

    <!-- 摄像机角度 -->
    <div
      v-if="state.cols.find(c => c.key === 'camera')?.visible"
      class="s-cell s-text"
      :style="{ width: state.cols.find(c => c.key === 'camera')?.width + 'px' }"
    >
      <RichCell :modelValue="shot.camera" rich @update:modelValue="(v) => updateShot(shot.id, { camera: String(v) })" />
    </div>

    <!-- 批量勾选 -->
    <div v-if="state.batch" class="s-cell s-check">
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('toggleSelect', shot.id)"
      />
    </div>

    <button class="row-del" @click="removeShot(shot.id)" title="删除">✕</button>
  </div>
</template>

<style scoped>
.shot-row {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  transition: background 0.1s;
}

.shot-row:hover { background: #f8fafc; }
.shot-row:hover .row-del { opacity: 1; }
.shot-row.dragging { opacity: 0.3; background: #eef2ff; }
.shot-row.drag-over { border-top: 2px solid var(--accent); }
.shot-row.selected { background: #eef2ff; }

.s-cell {
  display: flex;
  align-items: center;
  padding: 0;
  border-right: 1px solid #f1f5f9;
  min-height: 52px;
  flex-shrink: 0;
  overflow: hidden;
}

.s-sort { justify-content: center; flex-direction: column; gap: 1px; cursor: grab; }
.s-sort:active { cursor: grabbing; }
.s-num { justify-content: center; }
.s-img { padding: 2px 4px; display: flex; align-items: center; justify-content: center; }
.s-text { align-items: stretch; }
.s-content { flex: 1; min-width: 80px; }
.s-check { width: 36px; justify-content: center; }

.row-handle {
  font-size: 14px;
  color: #cbd5e1;
  cursor: grab;
  line-height: 1;
}

.row-handle:active { cursor: grabbing; }

.row-order {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1;
}

.shot-num {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.row-del {
  position: absolute;
  right: -28px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 11px;
  opacity: 0;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.row-del:hover { background: #fee2e2; color: var(--danger); }
</style>
