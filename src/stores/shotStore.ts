import type { Shot } from '../types'
import { state, uid, reorder, autoFitWidths, autoFitWidthsDebounced, removeShotImage } from './shared'

export function addShots(count: number = 1) {
  const sid = state.activeSceneId
  if (!sid) return
  for (let i = 0; i < count; i++) {
    const s: Shot = {
      id: uid(), sceneId: sid,
      order: state.shots.filter(x => x.sceneId === sid).length + i + 1,
      number: state.nextNum + i,
      image: null, frame: '', duration: 0,
      content: '', notes: '', reference: '',
      sceneExpect: '', sound: '', camera: '',
    }
    state.shots.push(s)
  }
  state.nextNum += count
  reorder()
  autoFitWidths()
}

export function removeShot(id: string) {
  const i = state.shots.findIndex(s => s.id === id)
  if (i > -1) {
    removeShotImage(id)
    state.shots.splice(i, 1)
    reorder()
  }
}

export function removeShots(ids: string[]) {
  const set = new Set(ids)
  ids.forEach(id => removeShotImage(id))
  state.shots = state.shots.filter(s => !set.has(s.id))
  reorder()
}

export function updateShot(id: string, patch: Partial<Shot>) {
  const s = state.shots.find(x => x.id === id)
  if (s) Object.assign(s, patch)
  autoFitWidthsDebounced()
}

/**
 * 拖拽排序
 * @param id      被拖拽的分镜 id
 * @param target  目标 1-indexed 订单号（before → t.order, after → t.order+1）
 */
export function moveShot(id: string, target: number) {
  const s = state.shots.find(x => x.id === id)
  if (!s) return
  const pool = state.shots
    .filter(x => x.sceneId === s.sceneId)
    .sort((a, b) => a.order - b.order)
  const idx = pool.findIndex(x => x.id === id)
  if (idx < 0) return

  // 先移除自己，再按 target 订单号找到插入位置
  pool.splice(idx, 1)

  // 在剩余 pool 中找订单号为 target 的 shot
  const targetIdx = pool.findIndex(x => x.order === target)
  const insertAt = targetIdx >= 0 ? targetIdx : pool.length

  pool.splice(insertAt, 0, s)
  pool.forEach((x, i) => { x.order = i + 1 })
}
