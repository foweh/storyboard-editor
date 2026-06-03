import { reactive, computed, watch } from 'vue'
import type { Shot, Scene, ColumnDef, ColumnKey, Tab } from '../types'

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* ── 多项目存储 ── */

const OLD_KEY = 'fenjing-data'
const PROJECTS_KEY = 'fenjing-projects'

/* ── 图片独立存储（IndexedDB，容量远大于 localStorage） ── */

const DB_NAME = 'fenjing-images'
const STORE_NAME = 'images'
let _dbPromise: Promise<IDBDatabase> | null = null

function openImageDB(): Promise<IDBDatabase> {
  if (_dbPromise) return _dbPromise
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return _dbPromise
}

export async function saveShotImage(shotId: string, dataUrl: string | null): Promise<boolean> {
  try {
    const db = await openImageDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    if (dataUrl) {
      store.put({ id: shotId, data: dataUrl })
    } else {
      store.delete(shotId)
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    return true
  } catch (e) {
    console.warn('图片存储失败', e)
    return false
  }
}

export async function loadShotImage(shotId: string): Promise<string | null> {
  try {
    const db = await openImageDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(shotId)
    const result = await new Promise<any>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    return result?.data ?? null
  } catch {
    return null
  }
}

export async function removeShotImage(shotId: string): Promise<void> {
  try {
    const db = await openImageDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(shotId)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch { /* ignore */ }
}

/** 将旧 localStorage 中的图片迁移到 IndexedDB */
async function migrateLegacyImages() {
  const OLD_PREFIX = 'fenjing-img-'
  let count = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(OLD_PREFIX)) {
      const shotId = key.slice(OLD_PREFIX.length)
      const dataUrl = localStorage.getItem(key)
      if (dataUrl) {
        await saveShotImage(shotId, dataUrl)
        localStorage.removeItem(key)
        count++
      }
    }
  }
  if (count > 0) console.log(`已迁移 ${count} 张图片从 localStorage 到 IndexedDB`)
}

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

function writeProjectData(id: string, data: any): boolean {
  try {
    localStorage.setItem(projectKey(id), JSON.stringify(data))
    return true
  } catch (e) {
    console.warn('项目数据保存失败，存储空间可能不足', e)
    return false
  }
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

// 恢复图片数据（主数据不存 base64，从 IndexedDB 异步加载）
// image: true 表示"有图在 IndexedDB 中"，异步填充；null 表示无图
if (loaded.shots) {
  loaded.shots.forEach((s: any) => {
    // 兼容旧格式：主数据中还有 base64 → 标记为 true，后续迁移到 IndexedDB
    if (s.image && typeof s.image === 'string' && s.image.startsWith('data:')) {
      (s.image as any) = true  // 会在下方的异步加载中处理
    }
    if (s.image === undefined) s.image = null
  })
}

// 异步：先迁移旧 localStorage 图片，再从 IndexedDB 加载图片到 state
;(async () => {
  await migrateLegacyImages()
  for (const s of state.shots) {
    if ((s.image as any) === true) {
      const img = await loadShotImage(s.id)
      s.image = img ?? null
    }
  }
})()

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

/** persist 串行队列，防止并发覆盖 */
let _persistChain: Promise<void> = Promise.resolve()

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

async function _persistImpl() {
  const data = snapshot()

  // 图片数据存 IndexedDB，主数据只存标记 true
  const saveTasks: Promise<boolean>[] = []
  data.shots.forEach((s: any) => {
    if (s.image && typeof s.image === 'string' && s.image.startsWith('data:')) {
      const task = saveShotImage(s.id, s.image).then(ok => {
        if (ok) (s.image as any) = true // 主数据只保留标记
        return ok
      })
      saveTasks.push(task)
    }
  })
  // 等待所有图片存完，再写主数据（防止主数据先保存但图片没存完）
  await Promise.allSettled(saveTasks)

  writeProjectData(activeProjectId, data)

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

export function persist(): Promise<void> {
  _persistChain = _persistChain.then(() => _persistImpl())
  return _persistChain
}

watch(() => ({ ...state, shots: [...state.shots], scenes: [...state.scenes] }), () => persist(), { deep: true })

export async function resetAll(projectName?: string) {
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
  await persist()
}

/* ── 项目切换 ── */

export function saveCurrentProjectToRegistry() {
  return persist()
}

export async function switchProject(id: string) {
  const data = readProjectData(id)
  if (!data) return

  // 先保存当前项目（等待完成）
  await persist()

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

export async function deleteProject(id: string) {
  // 删除项目时清理其图片
  const data = readProjectData(id)
  if (data?.shots) {
    for (const s of data.shots) {
      if (s.id) await removeShotImage(s.id)
    }
  }
  removeProjectData(id)
  const reg = readRegistry()
  reg.projects = reg.projects.filter(p => p.id !== id)
  if (reg.activeId === id) {
    reg.activeId = reg.projects[0]?.id ?? ''
  }
  writeRegistry(reg)

  // 如果删的是当前项目，切换到第一个
  if (id === activeProjectId && reg.activeId) {
    await switchProject(reg.activeId)
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
