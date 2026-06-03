<script setup lang="ts">
import { state } from '../stores/index'
import type { Tab } from '../types'

defineProps<{ tabs: { key: Tab; label: string; icon: string }[] }>()
</script>

<template>
  <nav class="side">
    <div class="side-brand">✧</div>
    <div class="side-nav">
      <button
        v-for="t in tabs"
        :key="t.key"
        :class="['side-btn', { active: state.tab === t.key }]"
        :title="t.label"
        @click="state.tab = t.key"
      >
        <span class="side-icon">{{ t.icon }}</span>
        <span class="side-label">{{ t.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.side {
  width: var(--sidebar-w);
  background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  z-index: 10;
}

.side-brand {
  height: var(--header-h);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #818cf8;
  width: 100%;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 0;
  width: 100%;
}

.side-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 4px 7px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.45);
  transition: all 0.2s;
  width: 100%;
  position: relative;
}

.side-btn:hover {
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.04);
}

.side-btn.active {
  color: #fff;
}

.side-btn.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  background: #818cf8;
  border-radius: 0 3px 3px 0;
}

.side-icon { font-size: 18px; line-height: 1; }
.side-label { font-size: 9.5px; line-height: 1.2; white-space: nowrap; }
</style>
