import { reactive, computed, watch } from 'vue'
import type { Shot, Scene, ColumnDef, ColumnKey, Tab } from '../types'

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* ── 多项目存储 ── */

const OLD_KEY = 'fenjing-data'
const PROJECTS_KEY = 'fenjing-projects'

export interface ProjectMeta {
  id: string
  name: string
  shotCount: number
  updatedAt: string
}

interface ProjectRegistry {
  projects: ProjectMeta[]
  activeId: string
}

function readRegistry(): ProjectRegistry {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { projects: [], activeId: '' }
}

function writeRegistry(r: ProjectRegistry) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(r))
}

function projectKey(id: string) {
  return `fenjing-project-${id}`
}

function readProjectData(id: string): any {
  try {
    const raw = localStorage.getItem(projectKey(id))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function writeProjectData(id: string, data: any) {
  localStorage.setItem(projectKey(id), JSON.stringify(data))
}

function removeProjectData(id: string) {
  localStorage.removeItem(projectKey(id))
}

/* ── 迁移旧数据 ── */

function migrateOldIfNeeded(registry: ProjectRegistry) {
  if (registry.projects.length > 0) return
  try {
    const raw = localStorage.getItem(OLD_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    const pid = uid()
    registry.projects.push({
      id: pid,
      name: data.project || '未命名项目',
      shotCount: (data.shots || []).length,
      updatedAt: new Date().toISOString(),
    })
    registry.activeId = pid
    writeRegistry(registry)
    writeProjectData(pid, data)
  } catch { /* ignore */ }
}

/* ── 加载状态 ── */

const registry = readRegistry()
migrateOldIfNeeded(registry)

// 如果 registry 有 activeId 但没有任何项目，创建默认项目
let activeProjectId = registry.activeId
if (!activeProjectId || !registry.projects.find(p => p.id === activeProjectId)) {
  activeProjectId = uid()
  registry.projects.push({ id: activeProjectId, name: '未命名项目', shotCount: 0, updatedAt: new Date().toISOString() })
  registry.activeId = activeProjectId
  writeRegistry(registry)
}

const loaded = readProjectData(activeProjectId) ?? {}

const defaultColumns: ColumnDef[] = [
  { key: 'sort',        label: '排序',     visible: true,  width: 56,  locked: true },
  { key: 'number',      label: '镜号',     visible: true,  width: 64,  locked: true },
  { key: 'image',       label: '画面',     visible: true,  width: 110 },
  { key: 'frame',       label: '景别',     visible: true,  width: 80 },
  { key: 'duration',    label: '时长(秒)',  visible: true,  width: 84 },
  { key: 'content',     label: '内容',     visible: true,  width: 220 },
  { key: 'notes',       label: '备注',     visible: true,  width: 150 },
  { key: 'reference',   label: '参考',     visible: false, width: 150 },
  { key: 'sceneExpect', label: '场景预期',  visible: false, width: 150 },
  { key: 'sound',       label: '声音',     visible: false, width: 130 },
  { key: 'camera',      label: '摄像机角度', visible: false, width: 130 },
]

export const state = reactive({
  project: loaded.project ?? '未命名项目',
  tab: (loaded.tab ?? 'storyboard') as Tab,
  shots: (loaded.shots ?? []) as Shot[],
  scenes: (loaded.scenes ?? [{ id: uid(), name: '第1场', order: 0 }]) as Scene[],
  cols: loaded.cols ?? defaultColumns,
  nextNum: loaded.nextNum ?? 1,
  batch: false as boolean,
  selected: new Set<string>(),
  activeSceneId: loaded.activeSceneId ?? (loaded.scenes?.[0]?.id ?? uid()),
})

export const activeShots = computed(() => {
  if (!state.activeSceneId) return []
  return state.shots
    .filter(s => s.sceneId === state.activeSceneId)
    .sort((a, b) => a.order - b.order)
})

export function reorder() {
  const groups = [...new Set(state.shots.map(s => s.sceneId))]
  groups.forEach(id => {
    state.shots
      .filter(s => s.sceneId === id)
      .sort((a, b) => a.order - b.order)
      .forEach((s, i) => { s.order = i + 1 })
  })
}

/* ── 持久化 ── */

function snapshot(): any {
  return {
    project: state.project,
    tab: state.tab,
    shots: state.shots.map(s => ({ ...s })),
    scenes: state.scenes.map(s => ({ ...s })),
    cols: state.cols.map(c => ({ ...c, locked: undefined })),
    nextNum: state.nextNum,
    activeSceneId: state.activeSceneId,
  }
}

export function persist() {
  writeProjectData(activeProjectId, snapshot())

  // 更新注册表
  const reg = readRegistry()
  const meta = reg.projects.find(p => p.id === activeProjectId)
  if (meta) {
    meta.name = state.project
    meta.shotCount = state.shots.length
    meta.updatedAt = new Date().toISOString()
  }
  reg.activeId = activeProjectId
  writeRegistry(reg)
}

watch(() => ({ ...state, shots: [...state.shots], scenes: [...state.scenes] }), () => persist(), { deep: true })

export function resetAll(projectName?: string) {
  const firstId = uid()
  state.shots = []
  state.scenes = [{ id: firstId, name: '第1场', order: 0 }]
  state.activeSceneId = firstId
  state.nextNum = 1
  state.project = projectName || '未命名项目'

  // 新项目用新的 id
  activeProjectId = uid()
  registry.projects.push({
    id: activeProjectId,
    name: state.project,
    shotCount: 0,
    updatedAt: new Date().toISOString(),
  })
  registry.activeId = activeProjectId
  writeRegistry(registry)
  persist()
}

/* ── 项目切换 ── */

export function saveCurrentProjectToRegistry() {
  persist()
}

export function switchProject(id: string) {
  const data = readProjectData(id)
  if (!data) return

  // 先保存当前项目
  persist()

  // 切换到目标项目
  activeProjectId = id
  state.project = data.project ?? '未命名项目'
  state.tab = (data.tab ?? 'storyboard') as Tab
  state.shots.splice(0, state.shots.length, ...(data.shots ?? []))
  state.scenes.splice(0, state.scenes.length, ...(data.scenes ?? []))
  state.cols.splice(0, state.cols.length, ...(data.cols ?? defaultColumns))
  state.nextNum = data.nextNum ?? 1
  state.activeSceneId = data.activeSceneId ?? (data.scenes?.[0]?.id ?? uid())

  // 更新注册表 activeId
  const reg = readRegistry()
  reg.activeId = id
  writeRegistry(reg)
}

export function listProjectsMeta(): ProjectMeta[] {
  return readRegistry().projects
}

export function deleteProject(id: string) {
  removeProjectData(id)
  const reg = readRegistry()
  reg.projects = reg.projects.filter(p => p.id !== id)
  if (reg.activeId === id) {
    reg.activeId = reg.projects[0]?.id ?? ''
  }
  writeRegistry(reg)

  // 如果删的是当前项目，切换到第一个
  if (id === activeProjectId && reg.activeId) {
    switchProject(reg.activeId)
  }
}

/* ── 自适应列宽 ── */

const TEXT_COLS: ColumnKey[] = ['frame', 'duration', 'content', 'notes', 'reference', 'sceneExpect', 'sound', 'camera']

export function autoFitWidths() {
  TEXT_COLS.forEach(key => {
    const col = state.cols.find(c => c.key === key)
    if (!col || col.locked) return

    let maxLen = 8
    state.shots.forEach(shot => {
      const val = String((shot as any)[key] ?? '')
      const plain = val.replace(/<[^>]*>/g, '')
      maxLen = Math.max(maxLen, plain.length)
    })

    const est = Math.round(Math.max(60, Math.min(400, maxLen * 8 + 24)))
    if (col.width !== est) col.width = est
  })
}

let fitTimer: number | undefined
export function autoFitWidthsDebounced() {
  if (fitTimer !== undefined) clearTimeout(fitTimer)
  fitTimer = window.setTimeout(() => { fitTimer = undefined; autoFitWidths() }, 400)
}
