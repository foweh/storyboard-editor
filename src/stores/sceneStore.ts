import { state, uid } from './shared'

export function setActiveScene(id: string) {
  if (state.scenes.some(s => s.id === id)) {
    state.activeSceneId = id
  }
}

export function addScene(name?: string) {
  const id = uid()
  state.scenes.push({
    id,
    name: name ?? `第${state.scenes.length + 1}场`,
    order: state.scenes.length,
  })
  // 新建场后自动切换到该场
  state.activeSceneId = id
}

export function removeScene(id: string) {
  if (state.scenes.length < 2) return
  const i = state.scenes.findIndex(s => s.id === id)
  if (i > -1) {
    state.scenes.splice(i, 1)
    state.shots = state.shots.filter(s => s.sceneId !== id)
    // 如果删除了当前场，切到第一个场
    if (state.activeSceneId === id) {
      state.activeSceneId = state.scenes[0].id
    }
  }
}
