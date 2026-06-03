<script setup lang="ts">
import { ref } from 'vue'
import { state, activeShots, moveShot, toggleSel, addShots, setActiveScene, removeScene } from '../stores/index'
import TableHeader from './TableHeader.vue'
import ShotRow from './ShotRow.vue'
import NewShotMenu from './NewShotMenu.vue'
import ColumnConfig from './ColumnConfig.vue'
import BatchBar from './BatchBar.vue'

const dragId = ref<string | null>(null)
const overId = ref<string | null>(null)
/** 'before' = 插入到目标行上方，'after' = 插入到目标行下方 */
const overPos = ref<'before' | 'after'>('before')

function onStart(id: string) { dragId.value = id }

function onOver(e: DragEvent, id: string) {
  e.preventDefault()
  if (id === dragId.value) {
    if (overId.value === id) overId.value = null
    return
  }
  // 计算鼠标在目标行中的位置 → 决定插入线在上方还是下方
  const row = (e.target as HTMLElement).closest('.shot-row')
  const rect = row?.getBoundingClientRect()
  if (row && rect) {
    const midY = rect.top + rect.height / 2
    overPos.value = e.clientY < midY ? 'before' : 'after'
  }
  overId.value = id
}
function onLeave(id: string) { if (overId.value === id) overId.value = null }

function onDrop(id: string) {
  if (id && dragId.value && dragId.value !== id) {
    const t = activeShots.value.find(s => s.id === id)
    if (t) {
      // before → 插在 target 的位置；after → 插在 target 之后
      moveShot(dragId.value, overPos.value === 'before' ? t.order : t.order + 1)
    }
  }
  dragId.value = null; overId.value = null; overPos.value = 'before'
}
</script>

<template>
  <div class="sb-view">
    <div class="sb-toolbar">
      <div class="sb-toolbar-left">
        <div class="sb-title-wrap">
          <h2 class="sb-title">分镜制作</h2>
          <span class="sb-badge">{{ activeShots.length }} 镜</span>
        </div>
        <NewShotMenu />
        <div class="scene-tags">
          <span
            v-for="sc in state.scenes"
            :key="sc.id"
            :class="['scene-tag', { active: sc.id === state.activeSceneId }]"
            @click="setActiveScene(sc.id)"
          >
            {{ sc.name }}
            <button
              v-if="state.scenes.length > 1"
              class="scene-del"
              @click.stop="removeScene(sc.id)"
              title="删除场"
            >✕</button>
          </span>
        </div>
      </div>
      <div class="sb-toolbar-right">
        <BatchBar />
        <ColumnConfig />
      </div>
    </div>

    <div class="sb-table-wrap" @dragover.prevent>
      <div class="sb-table">
        <TableHeader :cols="state.cols" :batch="state.batch" />
        <div class="sb-body">
          <ShotRow
            v-for="shot in activeShots"
            :key="shot.id"
            :shot="shot"
            :dragging="dragId === shot.id"
            :dragOverBefore="overId === shot.id && overPos === 'before'"
            :dragOverAfter="overId === shot.id && overPos === 'after'"
            :selected="state.selected.has(shot.id)"
            @dragStart="onStart"
            @dragOver="onOver"
            @dragLeave="onLeave"
            @drop="onDrop"
            @toggleSelect="toggleSel"
          />
          <!-- 透明占位行：点击创建新分镜，创建后自动下移 -->
          <div
            v-if="activeShots.length > 0"
            class="shot-row new-shot-placeholder"
            @click="addShots(1)"
            title="点击创建新分镜"
          >
            <div
              v-for="c in state.cols.filter(x => x.visible)"
              :key="c.key"
              class="s-cell"
              :class="{ 'ph-center': !['content','notes'].includes(c.key), 'ph-left': ['content','notes'].includes(c.key) }"
              :style="{ width: c.width + 'px' }"
            >
              <span v-if="c.key === 'sort'" class="ph-handle">⠿</span>
              <span v-else-if="c.key === 'number'" class="ph-num">+</span>
              <span v-else-if="c.key === 'image'" class="ph-img" @click.stop="addShots(1)">＋</span>
              <span v-else-if="c.key === 'content'" class="ph-text">点击创建新分镜…</span>
              <span v-else class="ph-dash">—</span>
            </div>
            <div v-if="state.batch" class="s-cell s-check" />
          </div>
          <div v-if="activeShots.length === 0" class="sb-empty">
            <span class="empty-icon">🎬</span>
            <p>还没有分镜，点「新建」开始制作</p>
          </div>
        </div>
      </div>
    </div>

    <div class="sb-footer">
      <span>{{ activeShots.length }} 个分镜</span>
      <span v-if="activeShots.length">
        总时长：{{ activeShots.reduce((s, x) => s + x.duration, 0) }}秒
      </span>
    </div>
  </div>
</template>

<style scoped>
.sb-view { display: flex; flex-direction: column; height: 100%; }

.sb-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 16px;
  flex-shrink: 0;
  gap: 12px;
  flex-wrap: wrap;
}

.sb-toolbar-left { display: flex; align-items: center; gap: 12px; }
.sb-toolbar-right { display: flex; align-items: center; gap: 6px; }

.sb-title-wrap { display: flex; align-items: center; gap: 8px; }

.sb-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.3px;
}

.sb-badge {
  padding: 2px 8px;
  background: var(--accent-light);
  color: var(--accent);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.scene-tags { display: flex; gap: 4px; flex-wrap: wrap; }

.scene-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
}

.scene-tag:hover { background: #e2e8f0; }
.scene-tag.active {
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 600;
}

.scene-del {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: none;
  background: transparent;
  color: #94a3b8;
  border-radius: 50%;
  cursor: pointer;
  font-size: 9px;
  line-height: 1;
  padding: 0;
  opacity: 0;
  transition: all 0.12s;
}

.scene-tag:hover .scene-del { opacity: 1; }
.scene-del:hover { background: #fee2e2; color: var(--danger); }

.sb-table-wrap {
  flex: 1;
  overflow: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.sb-table { min-width: 100%; display: flex; flex-direction: column; }
.sb-body { flex: 1; }

.sb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-icon { font-size: 40px; margin-bottom: 10px; opacity: 0.4; }
.sb-empty p { font-size: 14px; }

.sb-footer {
  display: flex;
  gap: 16px;
  padding: 10px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* ── 透明占位行 ── */
.new-shot-placeholder {
  cursor: pointer;
  opacity: 0.15;
  transition: opacity 0.2s ease, background 0.2s ease;
  border-top: 1.5px dashed var(--border);
  min-height: 52px;
  user-select: none;
}

.new-shot-placeholder:hover {
  opacity: 0.5;
  background: var(--accent-light);
  border-top-color: var(--accent);
}

.new-shot-placeholder .s-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-height: 52px;
  flex-shrink: 0;
  color: var(--text-muted);
  border-right: 1px solid #f1f5f9;
}

.ph-handle { font-size: 14px; color: #cbd5e1; line-height: 1; }

.ph-num {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
}

.ph-img { font-size: 14px; color: #94a3b8; line-height: 1; }

.ph-text {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.ph-dash { font-size: 12px; color: #cbd5e1; }

.new-shot-placeholder .s-check { justify-content: center; }

/* 占位行对齐 */
.ph-center { justify-content: center; }
.ph-left { justify-content: flex-start; }
.ph-left .ph-text { padding-left: 4px; }
</style>
