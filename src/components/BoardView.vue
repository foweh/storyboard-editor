<script setup lang="ts">
import { computed, ref } from 'vue'
import { state, activeShots, updateShot } from '../stores/index'
import RichCell from './RichCell.vue'
import ImageCell from './ImageCell.vue'

const sorted = computed(() =>
  activeShots.value.sort((a, b) => a.order - b.order)
)

const selectedId = ref<string | null>(null)
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
        :class="['board-card', { active: selectedId === s.id }]"
        @click="selectedId = s.id"
      >
        <!-- 画面（可点击上传/替换） -->
        <div class="card-img" @click.stop>
          <ImageCell
            :image="s.image"
            @update="(v) => updateShot(s.id, { image: v })"
          />
        </div>

        <!-- 元信息行：镜号 + 景别 + 时长 -->
        <div class="card-meta">
          <span class="card-num">#{{ s.number }}</span>
          <span class="card-tag-wrap" @click.stop>
            <RichCell
              :modelValue="s.frame"
              class="card-tag"
              @update:modelValue="(v) => updateShot(s.id, { frame: String(v) })"
            />
          </span>
          <span class="card-tag-wrap" @click.stop>
            <RichCell
              :modelValue="s.duration"
              type="number"
              class="card-tag card-tag-dur"
              @update:modelValue="(v) => updateShot(s.id, { duration: Number(v) })"
            />
          </span>
        </div>

        <!-- 内容（可编辑） -->
        <div class="card-text" @click.stop>
          <RichCell
            :modelValue="s.content"
            rich
            @update:modelValue="(v) => updateShot(s.id, { content: String(v) })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board { height: 100%; display: flex; flex-direction: column; }
.board-head { display: flex; align-items: center; gap: 10px; padding: 0 0 16px; flex-shrink: 0; }

.view-title { font-size: 18px; font-weight: 700; }
.view-count { font-size: 12px; color: var(--text-muted); }

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 12px;
  flex: 1;
  overflow: auto;
  align-content: start;
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

.card-img :deep(.img-cell) {
  width: 100%;
  height: 100%;
  border-radius: 0;
  border: none;
}

.card-meta {
  display: flex;
  gap: 4px;
  padding: 7px 10px 0;
  align-items: center;
}

.card-num {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  white-space: nowrap;
}

.card-tag-wrap {
  display: inline-flex;
  min-width: 0;
}

.card-tag-wrap :deep(.rich-cell) {
  min-height: 20px;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 10px;
  background: var(--bg-hover);
  color: var(--text-muted);
}

.card-tag-wrap :deep(.rich-cell:hover) {
  background: #e2e8f0;
}

.card-tag-wrap :deep(.cell-pv) {
  font-size: 10px;
  -webkit-line-clamp: 1;
}

.card-tag-dur :deep(.cell-inp) {
  font-size: 10px;
  padding: 1px 4px;
  min-height: 18px;
}

/* 内容区域 */
.card-text {
  padding: 4px 10px 10px;
  min-height: 30px;
}

.card-text :deep(.rich-cell) {
  min-height: 22px;
  padding: 2px 4px;
}

.card-text :deep(.cell-pv) {
  font-size: 11px;
  color: var(--text-secondary);
  -webkit-line-clamp: 3;
}

.card-text :deep(.cell-pv p) { margin: 1px 0; }

.card-text :deep(.rich-editor) {
  font-size: 11px;
  min-height: 22px;
  padding: 2px 4px;
}

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
