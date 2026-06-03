<script setup lang="ts">
import { computed } from 'vue'
import { state, activeShots } from '../stores/index'

const sorted = computed(() =>
  activeShots.value.sort((a, b) => a.order - b.order)
)

const totalDur = computed(() =>
  sorted.value.reduce((s, x) => s + x.duration, 0)
)

const frameDist = computed(() => {
  const m: Record<string, number> = {}
  sorted.value.forEach(s => {
    const k = s.frame || '未设'
    m[k] = (m[k] || 0) + 1
  })
  return m
})
</script>

<template>
  <div class="plan">
    <div class="plan-head">
      <h2 class="view-title">拍摄计划</h2>
      <span class="view-count">{{ sorted.length }} 个镜头</span>
    </div>

    <div v-if="sorted.length === 0" class="empty">
      <span class="empty-icon">📋</span>
      <p>暂无分镜数据</p>
    </div>

    <template v-else>
      <!-- 统计卡片 -->
      <div class="stat-row">
        <div class="stat-card">
          <span class="stat-val">{{ sorted.length }}</span>
          <span class="stat-lbl">镜头</span>
        </div>
        <div class="stat-card">
          <span class="stat-val">{{ totalDur }}</span>
          <span class="stat-lbl">总秒数</span>
        </div>
        <div class="stat-card">
          <span class="stat-val">{{ state.scenes.length }}</span>
          <span class="stat-lbl">场次</span>
        </div>
      </div>

      <!-- 景别分布 -->
      <div class="plan-section">
        <h3 class="section-title">景别分布</h3>
        <div class="dist-list">
          <div v-for="(n, k) in frameDist" :key="k" class="dist-row">
            <span class="dist-label">{{ k }}</span>
            <div class="dist-track">
              <div
                class="dist-fill"
                :style="{ width: (n / sorted.length * 100) + '%' }"
              />
            </div>
            <span class="dist-num">{{ n }}</span>
          </div>
        </div>
      </div>

      <!-- 拍摄清单 -->
      <div class="plan-section">
        <h3 class="section-title">拍摄清单</h3>
        <div class="plan-table">
          <div class="pt-head">
            <span class="pt-c seq">#</span>
            <span class="pt-c num">镜号</span>
            <span class="pt-c frame">景别</span>
            <span class="pt-c dur">时长</span>
            <span class="pt-c cont">内容</span>
          </div>
          <div v-for="(s, i) in sorted" :key="s.id" class="pt-row">
            <span class="pt-c seq">{{ i + 1 }}</span>
            <span class="pt-c num">{{ s.number }}</span>
            <span class="pt-c frame">{{ s.frame || '—' }}</span>
            <span class="pt-c dur">{{ s.duration }}s</span>
            <span class="pt-c cont" v-html="s.content || '—'" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.plan { height: 100%; display: flex; flex-direction: column; overflow: auto; }
.plan-head { display: flex; align-items: center; gap: 10px; padding: 0 0 16px; flex-shrink: 0; }

.view-title { font-size: 18px; font-weight: 700; }
.view-count { font-size: 12px; color: var(--text-muted); }

.stat-row { display: flex; gap: 10px; margin-bottom: 20px; flex-shrink: 0; }

.stat-card {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-val { font-size: 26px; font-weight: 700; color: var(--accent); }
.stat-lbl { font-size: 11px; color: var(--text-muted); }

.plan-section { margin-bottom: 20px; }

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text);
}

.dist-list {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.dist-label { width: 50px; font-size: 12px; flex-shrink: 0; }
.dist-track { flex: 1; height: 18px; background: var(--bg-hover); border-radius: 9px; overflow: hidden; }
.dist-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #6366f1); border-radius: 9px; opacity: 0.65; transition: width 0.3s; }
.dist-num { width: 24px; text-align: right; font-size: 12px; color: var(--text-muted); }

.plan-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }

.pt-head, .pt-row {
  display: flex;
  padding: 7px 12px;
  font-size: 12px;
}

.pt-head { background: #f1f5f9; font-weight: 600; color: #475569; }
.pt-row { border-top: 1px solid #f1f5f9; }
.pt-row:last-child { border-bottom: none; }

.pt-c.seq { width: 32px; }
.pt-c.num { width: 44px; }
.pt-c.frame { width: 50px; }
.pt-c.dur { width: 54px; }
.pt-c.cont { flex: 1; }

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
