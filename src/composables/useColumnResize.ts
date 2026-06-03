import type { ColumnKey } from '../types'
import { setColWidth } from '../stores/columnStore'

export function useColResize() {
  let col: ColumnKey | null = null
  let startX = 0, startW = 0

  function begin(e: MouseEvent, key: ColumnKey, w: number) {
    e.preventDefault()
    col = key; startX = e.clientX; startW = w
    const move = (ev: MouseEvent) => {
      if (col) setColWidth(col, Math.max(36, startW + ev.clientX - startX))
    }
    const up = () => {
      col = null
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  return { begin }
}
