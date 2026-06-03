import type { ColumnKey } from '../types'
import { state } from './shared'

export function toggleCol(key: ColumnKey) {
  const c = state.cols.find(x => x.key === key)
  if (c && !c.locked) c.visible = !c.visible
}

export function setColWidth(key: ColumnKey, w: number) {
  const c = state.cols.find(x => x.key === key)
  if (c) c.width = Math.max(36, w)
}
