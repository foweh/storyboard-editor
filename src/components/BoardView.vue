<script setup lang="ts">
import { computed, ref } from 'vue'
import { state, activeShots } from '../stores/index'

const sorted = computed(() =>
  activeShots.value.sort((a, b) => a.order - b.order)
)

const sel = ref<string | null>(null)
</script>

<template>
  <div class="board">
    <div class="board-head">
      <h2 class="view-title">故事板</h2>
      <span class="view-count">{{ sorted.length }} 个镜头</span>
    </div>

    <div v-if="sorted.length === 0" class="empty">
      <span class="empty-icon">🎞</span>
      <p>暂无分镜数据</p>
    </div>

    <div v-else class="board-grid">
      <div
        v-for="s in sorted"
        :key="s.id"
        :class="['board-card', { active: sel === s.id }]"
        @click="sel = s.id"
      >
        <div class="card-img">
          <img v-if="s.image" :src="s.image" alt="" />
          <div v-else class="card-noimg">🎬</div>
        </div>
        <div class="card-meta">
          <span class="card-num">#{{ s.number }}</span>
          <span v-if="s.frame" class="card-tag">{{ s.frame }}</span>
          <span v-if="s.duration" class="card-tag">{{ s.duration }}s</span>
        </div>
        <div v-if="s.content" class="card-text" v-html="s.content" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.board { height: 100%; display: flex; flex-direction: column; }
.board-head { display: flex; align-items: center; gap: 10px; padding: 0 0 16px; }

.view-title { font-size: 18px; font-weight: 700; }
.view-count { font-size: 12px; color: var(--text-muted); }

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 12px;
  flex: 1;
  overflow: auto;
}

.board-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
}

.board-card:hover {
  border-color: #cbd5e1;
  box-shadow: var(--shadow);
}

.board-card.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.card-img {
  aspect-ratio: 16/9;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-img img { width: 100%; height: 100%; object-fit: cover; }

.card-noimg { font-size: 28px; opacity: 0.25; }

.card-meta {
  display: flex;
  gap: 4px;
  padding: 7px 10px 0;
  align-items: center;
}

.card-num { font-size: 12px; font-weight: 600; color: var(--accent); }

.card-tag {
  font-size: 10px;
  padding: 1px 5px;
  background: var(--bg-hover);
  border-radius: 3px;
  color: var(--text-muted);
}

.card-text {
  padding: 4px 10px 10px;
  font-size: 11px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-text :deep(p) { margin: 1px 0; }

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text-muted);
}

.empty-icon { font-size: 44px; margin-bottom: 10px; opacity: 0.35; }
</style>
