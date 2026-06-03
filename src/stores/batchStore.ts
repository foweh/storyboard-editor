import { state } from './shared'
import { removeShots } from './shotStore'

export function toggleBatch() {
  state.batch = !state.batch
  if (!state.batch) state.selected.clear()
}

export function toggleSel(id: string) {
  state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id)
}

export function selAll() {
  state.shots.forEach(s => state.selected.add(s.id))
}

export function selNone() {
  state.selected.clear()
}

export function delSelected() {
  removeShots(Array.from(state.selected))
  state.selected.clear()
}
