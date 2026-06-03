<script setup lang="ts">
import { state, toggleBatch, selAll, selNone, delSelected } from '../stores/index'
</script>

<template>
  <div class="batch-bar">
    <button
      :class="['h-btn', { active: state.batch }]"
      @click="toggleBatch()"
    >
      ☑️ 批量
    </button>
    <template v-if="state.batch">
      <span class="batch-info">{{ state.selected.size }} 个已选</span>
      <button class="h-btn sm" @click="selAll()">全选</button>
      <button class="h-btn sm" @click="selNone()">清空</button>
      <button
        class="h-btn sm danger"
        :disabled="state.selected.size === 0"
        @click="delSelected()"
      >
        删除
      </button>
    </template>
  </div>
</template>

<style scoped>
.batch-bar { display: flex; align-items: center; gap: 6px; }

.h-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.12s;
}

.h-btn:hover { border-color: var(--accent); color: var(--accent); }
.h-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.h-btn.sm { padding: 4px 8px; font-size: 11px; }
.h-btn.danger { color: var(--danger); }
.h-btn.danger:disabled { opacity: 0.35; cursor: not-allowed; }

.batch-info { font-size: 11px; color: var(--text-muted); }
</style>
