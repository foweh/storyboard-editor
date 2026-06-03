import { state } from './shared'

export function toJSON(): string {
  return JSON.stringify({
    project: state.project,
    scenes: state.scenes,
    shots: state.shots.map(({ image, ...r }) => ({ ...r, hasImage: !!image })),
  }, null, 2)
}

export function toCSV(): string {
  const head = ['镜号', '景别', '时长(秒)', '内容', '备注', '参考', '场景预期', '声音', '摄像机角度']
  const rows = state.shots
    .sort((a, b) => a.order - b.order)
    .map(s => [
      s.number, s.frame, s.duration,
      csvEsc(s.content), csvEsc(s.notes),
      csvEsc(s.reference), csvEsc(s.sceneExpect),
      csvEsc(s.sound), csvEsc(s.camera),
    ].join(','))
  return '\uFEFF' + [head.join(','), ...rows].join('\n')
}

function csvEsc(v: string) {
  const t = String(v).replace(/"/g, '""')
  return t.includes(',') || t.includes('"') || t.includes('\n') ? `"${t}"` : t
}
