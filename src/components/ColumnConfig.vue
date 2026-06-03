<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { state, toggleCol } from '../stores/index'

const open = ref(false)
const el = ref<HTMLElement | null>(null)

function out(e: MouseEvent) {
  if (el.value && !el.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('click', out))
onUnmounted(() => document.removeEventListener('click', out))
</script>

<template>
  <div ref="el" class="col-config">
    <button :class="['h-btn', { active: open }]" @click="open = !open">
      ⚙️ 列设置
    </button>
    <div v-if="open" class="col-panel">
      <div class="col-title">显示列</div>
      <label
        v-for="c in state.cols.filter(x => !x.locked)"
        :key="c.key"
        class="col-item"
      >
        <input type="checkbox" :checked="c.visible" @change="toggleCol(c.key)" />
        <span>{{ c.label }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.col-config { position: relative; }

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

.h-btn:hover, .h-btn.active { border-color: var(--accent); color: var(--accent); }

.col-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  z-index: 100;
  min-width: 160px;
  padding: 8px;
  animation: drop-in 0.1s ease-out;
}

@keyframes drop-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; }
}

.col-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px 8px;
}

.col-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text);
  transition: background 0.1s;
}

.col-item:hover { background: var(--bg-hover); }
.col-item input { accent-color: var(--accent); }
</style>
