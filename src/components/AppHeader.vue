<script setup lang="ts">
import { ref } from 'vue'
import { state, toJSON, toCSV, resetAll } from '../stores/index'
import type { Tab } from '../types'

const tabs: { key: Tab; label: string }[] = [
  { key: 'storyboard', label: '分镜制作' },
  { key: 'board',      label: '故事板' },
  { key: 'plan',       label: '拍摄计划' },
  { key: 'callSheet',  label: '拍摄通告' },
]

const showExport = ref(false)
const showReset = ref(false)

function dlJSON() {
  const b = new Blob([toJSON()], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(b); a.download = '分镜数据.json'; a.click()
}

function dlCSV() {
  const b = new Blob([toCSV()], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(b); a.download = '分镜数据.csv'; a.click()
}
</script>

<template>
  <header class="header">
    <div class="header-left">
      <span class="project-name">{{ state.project }}</span>
      <div class="header-tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          :class="['tab-btn', { active: state.tab === t.key }]"
          @click="state.tab = t.key"
        >
          {{ t.label }}
          <span v-if="state.tab === t.key" class="tab-underline" />
        </button>
      </div>
    </div>
    <div class="header-right">
      <button class="h-btn" disabled title="协作（即将推出）">
        <span>👥</span><span>协作</span>
      </button>
      <div class="export-wrap">
        <button class="h-btn" @click="showExport = !showExport">
          <span>📤</span><span>导出</span>
        </button>
        <div v-if="showExport" class="export-drop" @mouseleave="showExport = false">
          <button @click="dlJSON(); showExport = false">导出 JSON</button>
          <button @click="dlCSV(); showExport = false">导出 CSV</button>
        </div>
      </div>
      <div class="header-divider" />
      <button class="h-btn icon" @click="showReset = true" title="重置">↻</button>
      <div class="avatar" title="本地模式">👤</div>
    </div>

    <Teleport to="body">
      <div v-if="showReset" class="modal-mask" @click.self="showReset = false">
        <div class="modal">
          <h3>重置项目</h3>
          <p>将清除所有分镜数据，不可恢复。</p>
          <div class="modal-actions">
            <button class="btn" @click="showReset = false">取消</button>
            <button class="btn btn-danger" @click="resetAll(); showReset = false">确认重置</button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-h);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.project-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.header-tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  position: relative;
  padding: 6px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all 0.15s;
}

.tab-btn:hover {
  color: var(--text);
  background: var(--bg-hover);
}

.tab-btn.active {
  color: var(--accent);
  font-weight: 600;
}

.tab-underline {
  position: absolute;
  bottom: -1px;
  left: 14px;
  right: 14px;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.h-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.h-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.h-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.h-btn.icon { padding: 6px 8px; font-size: 15px; }

.header-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 4px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.export-wrap { position: relative; }
.export-drop {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  z-index: 100;
  min-width: 130px;
  overflow: hidden;
}

.export-drop button {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  color: var(--text);
}

.export-drop button:hover { background: var(--bg-hover); }

/* Modal */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 28px;
  min-width: 340px;
  box-shadow: var(--shadow-lg);
  animation: modal-in 0.15s ease-out;
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal h3 { font-size: 16px; margin-bottom: 8px; }
.modal p { color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5; }

.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }

.btn {
  padding: 7px 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  cursor: pointer;
  font-size: 13px;
  background: var(--bg-card);
  color: var(--text);
  transition: all 0.12s;
}

.btn:hover { border-color: var(--accent); color: var(--accent); }

.btn-danger {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

.btn-danger:hover { opacity: 0.9; color: #fff; }
</style>
