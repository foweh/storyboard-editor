<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { addShots, addScene } from '../stores/index'

const open = ref(false)
const el = ref<HTMLElement | null>(null)

function toggle() { open.value = !open.value }
function close() { open.value = false }

function create(n: number) { addShots(n); close() }
function scene() { addScene(); close() }

function out(e: MouseEvent) {
  if (el.value && !el.value.contains(e.target as Node)) close()
}
onMounted(() => document.addEventListener('click', out))
onUnmounted(() => document.removeEventListener('click', out))
</script>

<template>
  <div ref="el" class="new-menu">
    <button class="btn-primary" @click="toggle">
      <span class="btn-plus">＋</span>
      新建
      <span class="btn-arrow">▾</span>
    </button>
    <div v-if="open" class="new-drop">
      <button @click="create(1)"><span class="drop-icon">🎬</span> 创建分镜</button>
      <button @click="create(5)"><span class="drop-icon">🎬×5</span> 创建5个分镜</button>
      <button @click="create(10)"><span class="drop-icon">🎬×10</span> 创建10个分镜</button>
      <div class="drop-div" />
      <button @click="scene"><span class="drop-icon">🏷️</span> 创建场</button>
    </div>
  </div>
</template>

<style scoped>
.new-menu { position: relative; }

.btn-primary {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 18px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(79,70,229,0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(79,70,229,0.35);
}

.btn-plus { font-size: 15px; }
.btn-arrow { font-size: 10px; margin-left: 2px; }

.new-drop {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  z-index: 100;
  min-width: 160px;
  overflow: hidden;
  animation: drop-in 0.1s ease-out;
}

@keyframes drop-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.new-drop button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  color: var(--text);
  transition: background 0.1s;
}

.new-drop button:hover { background: var(--bg-hover); }

.drop-icon { width: 28px; text-align: center; font-size: 13px; }
.drop-div { height: 1px; background: var(--border); margin: 3px 0; }
</style>
