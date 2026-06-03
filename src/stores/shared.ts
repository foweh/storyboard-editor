import { reactive, computed, watch } from 'vue'
import type { Shot, Scene, ColumnDef, ColumnKey, Tab } from '../types'

const KEY = 'fenjing-data'

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { }
  return {}
}

const saved = load()

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
  project: saved.project ?? '未命名项目',
  tab: (saved.tab ?? 'storyboard') as Tab,
  shots: (saved.shots ?? []) as Shot[],
  scenes: (saved.scenes ?? [{ id: uid(), name: '第1场', order: 0 }]) as Scene[],
  cols: saved.cols ?? defaultColumns,
  nextNum: saved.nextNum ?? 1,
  batch: false as boolean,
  selected: new Set<string>(),
  activeSceneId: saved.activeSceneId ?? (saved.scenes?.[0]?.id ?? uid()),
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

export function persist() {
  const data = {
    project: state.project,
    tab: state.tab,
    shots: state.shots.map(s => ({ ...s })),
    scenes: state.scenes.map(s => ({ ...s })),
    cols: state.cols.map(c => ({ ...c, locked: undefined })),
    nextNum: state.nextNum,
    activeSceneId: state.activeSceneId,
  }
  localStorage.setItem(KEY, JSON.stringify(data))
}

watch(() => ({ ...state, shots: [...state.shots], scenes: [...state.scenes] }), () => persist(), { deep: true })

export function resetAll(projectName?: string) {
  const firstId = uid()
  state.shots = []
  state.scenes = [{ id: firstId, name: '第1场', order: 0 }]
  state.activeSceneId = firstId
  state.nextNum = 1
  state.project = projectName || '未命名项目'
  persist()
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

    // 中文字符 ~1em (12px)，ASCII ~0.5em，取平均 8px/字 + 两侧 padding 24px
    const est = Math.round(Math.max(60, Math.min(400, maxLen * 8 + 24)))
    if (col.width !== est) col.width = est
  })
}

let fitTimer: number | undefined
export function autoFitWidthsDebounced() {
  if (fitTimer !== undefined) clearTimeout(fitTimer)
  fitTimer = window.setTimeout(() => { fitTimer = undefined; autoFitWidths() }, 400)
}
