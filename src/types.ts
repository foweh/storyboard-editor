/** 分镜 */
export interface Shot {
  id: string
  sceneId: string
  order: number
  number: number
  image: string | null
  frame: string
  duration: number
  content: string
  notes: string
  reference: string
  sceneExpect: string
  sound: string
  camera: string
  /** 用户拖拽设定的行高（px），undefined 表示自动撑高 */
  rowHeight?: number
}

/** 场次 */
export interface Scene {
  id: string
  name: string
  order: number
}

/** 列定义 */
export type ColumnKey =
  | 'sort' | 'number' | 'image' | 'frame' | 'duration'
  | 'content' | 'notes' | 'reference' | 'sceneExpect' | 'sound' | 'camera'

export interface ColumnDef {
  key: ColumnKey
  label: string
  visible: boolean
  width: number
  locked?: boolean
}

/** 工作区标签 */
export type Tab = 'storyboard' | 'board' | 'plan' | 'callSheet'
