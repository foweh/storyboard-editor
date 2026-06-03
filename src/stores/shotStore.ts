import type { Shot } from '../types'
import { state, uid, reorder, autoFitWidths, autoFitWidthsDebounced } from './shared'

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
  if (i > -1) { state.shots.splice(i, 1); reorder() }
}

export function removeShots(ids: string[]) {
  const set = new Set(ids)
  state.shots = state.shots.filter(s => !set.has(s.id))
  reorder()
}

export function updateShot(id: string, patch: Partial<Shot>) {
  const s = state.shots.find(x => x.id === id)
  if (s) Object.assign(s, patch)
  autoFitWidthsDebounced()
}

export function moveShot(id: string, target: number) {
  const s = state.shots.find(x => x.id === id)
  if (!s) return
  const pool = state.shots
    .filter(x => x.sceneId === s.sceneId)
    .sort((a, b) => a.order - b.order)
  const idx = pool.findIndex(x => x.id === id)
  if (idx < 0) return
  pool.splice(idx, 1)
  pool.splice(Math.min(target, pool.length), 0, s)
  pool.forEach((x, i) => { x.order = i + 1 })
}
