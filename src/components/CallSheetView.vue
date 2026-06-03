<script setup lang="ts">
import { computed } from 'vue'
import { state, activeShots } from '../stores/index'

const sorted = computed(() =>
  activeShots.value.sort((a, b) => a.order - b.order)
)

const total = computed(() =>
  sorted.value.reduce((s, x) => s + x.duration, 0)
)

const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
})
</script>

<template>
  <div class="sheet">
    <div class="sheet-head">
      <h2 class="view-title">拍摄通告</h2>
      <span class="sheet-date">{{ today }}</span>
    </div>

    <div v-if="sorted.length === 0" class="empty">
      <span class="empty-icon">📄</span>
      <p>暂无分镜数据</p>
    </div>

    <template v-else>
      <!-- 基本信息 -->
      <div class="sheet-meta">
        <div class="meta-item">
          <span class="meta-label">项目</span>
          <span class="meta-val">{{ state.project }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">日期</span>
          <span class="meta-val">{{ today }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">镜头</span>
          <span class="meta-val">{{ sorted.length }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">预估</span>
          <span class="meta-val">{{ total }} 秒</span>
        </div>
      </div>

      <!-- 通告表 -->
      <div class="sheet-table">
        <div class="st-head">
          <span class="st-c seq">#</span>
          <span class="st-c num">镜号</span>
          <span class="st-c frame">景别</span>
          <span class="st-c dur">时长</span>
          <span class="st-c cont">内容</span>
          <span class="st-c note">备注</span>
        </div>
        <div v-for="(s, i) in sorted" :key="s.id" class="st-row">
          <span class="st-c seq">{{ i + 1 }}</span>
          <span class="st-c num">{{ s.number }}</span>
          <span class="st-c frame">{{ s.frame || '—' }}</span>
          <span class="st-c dur">{{ s.duration }}s</span>
          <span class="st-c cont" v-html="s.content || '—'" />
          <span class="st-c note" v-html="s.notes || '—'" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sheet { height: 100%; display: flex; flex-direction: column; }
.sheet-head { display: flex; align-items: center; gap: 10px; padding: 0 0 16px; flex-shrink: 0; }

.view-title { font-size: 18px; font-weight: 700; }
.sheet-date { font-size: 12px; color: var(--text-muted); }

.sheet-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  margin-bottom: 16px;
}

.meta-item { display: flex; gap: 6px; font-size: 13px; }
.meta-label { color: var(--text-muted); min-width: 40px; }
.meta-val { font-weight: 500; }

.sheet-table {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: auto;
}

.st-head, .st-row {
  display: flex;
  padding: 7px 12px;
  font-size: 12px;
}

.st-head { background: #f1f5f9; font-weight: 600; color: #475569; position: sticky; top: 0; }
.st-row { border-top: 1px solid #f1f5f9; }
.st-row:last-child { border-bottom: none; }

.st-c.seq { width: 32px; }
.st-c.num { width: 44px; }
.st-c.frame { width: 50px; }
.st-c.dur { width: 50px; }
.st-c.cont { flex: 1; }
.st-c.note { width: 110px; }


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
