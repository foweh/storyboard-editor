<script setup lang="ts">
import { state, activeShots, moveShot, toggleSel } from '../stores/index'
import TableHeader from './TableHeader.vue'
import ShotRow from './ShotRow.vue'
import NewShotMenu from './NewShotMenu.vue'
import ColumnConfig from './ColumnConfig.vue'
import BatchBar from './BatchBar.vue'

let dragId: string | null = null
let overId: string | null = null

function onStart(id: string) { dragId = id }
function onOver(e: DragEvent, id: string) {
  e.preventDefault()
  if (id !== overId && id !== dragId) overId = id
}
function onLeave(id: string) { if (overId === id) overId = null }
function onDrop(id: string) {
  if (!id) { dragId = null; overId = null; return }
  if (dragId && dragId !== id) {
    const t = activeShots.value.find(s => s.id === id)
    if (t) moveShot(dragId, t.order)
  }
  dragId = null; overId = null
}
</script>

<template>
  <div class="sb-view">
    <!-- 工具栏 -->
    <div class="sb-toolbar">
      <div class="sb-toolbar-left">
        <div class="sb-title-wrap">
          <h2 class="sb-title">分镜制作</h2>
          <span class="sb-badge">{{ activeShots.length }} 镜</span>
        </div>
        <NewShotMenu />
        <div class="scene-tags">
          <span v-for="sc in state.scenes" :key="sc.id" class="scene-tag">{{ sc.name }}</span>
        </div>
      </div>
      <div class="sb-toolbar-right">
        <BatchBar />
        <ColumnConfig />
      </div>
    </div>

    <!-- 表格 -->
    <div class="sb-table-wrap">
      <div class="sb-table">
        <TableHeader :cols="state.cols" :batch="state.batch" />
        <div class="sb-body">
          <ShotRow
            v-for="shot in activeShots"
            :key="shot.id"
            :shot="shot"
            :dragging="dragId === shot.id"
            :dragOver="overId === shot.id"
            :selected="state.selected.has(shot.id)"
            @dragStart="onStart"
            @dragOver="onOver"
            @dragLeave="onLeave"
            @drop="onDrop"
            @toggleSelect="toggleSel"
          />
          <div v-if="activeShots.length === 0" class="sb-empty">
            <span class="empty-icon">🎬</span>
            <p>还没有分镜，点「新建」开始制作</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 -->
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

/* 工具栏 */
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

.scene-tags { display: flex; gap: 4px; }

.scene-tag {
  padding: 3px 8px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

/* 表格 */
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

/* 空状态 */
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

/* 底部 */
.sb-footer {
  display: flex;
  gap: 16px;
  padding: 10px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>
