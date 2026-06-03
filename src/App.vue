<script setup lang="ts">
import { computed } from 'vue'
import { state } from './stores/index'
import type { Tab } from './types'
import AppHeader from './components/AppHeader.vue'
import SidePanel from './components/SidePanel.vue'
import StoryboardView from './components/StoryboardView.vue'
import BoardView from './components/BoardView.vue'
import PlanView from './components/PlanView.vue'
import CallSheetView from './components/CallSheetView.vue'

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'storyboard', label: '分镜制作', icon: '🎬' },
  { key: 'board',      label: '故事板',   icon: '🎞' },
  { key: 'plan',       label: '拍摄计划', icon: '📋' },
  { key: 'callSheet',  label: '拍摄通告', icon: '📄' },
]

const view = computed(() => {
  const m: Record<Tab, any> = {
    storyboard: StoryboardView,
    board: BoardView,
    plan: PlanView,
    callSheet: CallSheetView,
  }
  return m[state.tab]
})
</script>

<template>
  <div class="app">
    <SidePanel :tabs="tabs" />
    <div class="main">
      <AppHeader />
      <div class="content">
        <component :is="view" />
      </div>
    </div>
  </div>
</template>
