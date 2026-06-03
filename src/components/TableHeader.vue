<script setup lang="ts">
import type { ColumnDef, ColumnKey } from '../types'
import { useColResize } from '../composables/useColumnResize'

const props = defineProps<{ cols: ColumnDef[]; batch: boolean }>()
const { begin } = useColResize()
</script>

<template>
  <div class="th-row">
    <div
      v-for="c in cols.filter(x => x.visible)"
      :key="c.key"
      class="th-cell"
      :style="{ width: c.width + 'px' }"
    >
      <span class="th-label">{{ c.label }}</span>
      <div class="th-resize" @mousedown.prevent="begin($event, c.key as ColumnKey, c.width)" />
    </div>
    <div v-if="batch" class="th-cell th-check" />
    <div class="th-cell th-fill" />
  </div>
</template>

<style scoped>
.th-row {
  display: flex;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 5;
}

.th-cell {
  display: flex;
  align-items: center;
  padding: 7px 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  border-right: 1px solid #e2e8f0;
  flex-shrink: 0;
  position: relative;
  min-height: 34px;
  letter-spacing: 0.3px;
}

.th-check { width: 36px; min-width: 36px; }
.th-fill { flex: 1; border-right: none; }

.th-resize {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  z-index: 3;
}

.th-resize:hover { background: var(--accent); opacity: 0.25; }
</style>
