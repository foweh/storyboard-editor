import { state, uid } from './shared'

export function addScene(name?: string) {
  state.scenes.push({
    id: uid(),
    name: name ?? `第${state.scenes.length + 1}场`,
    order: state.scenes.length,
  })
}

export function removeScene(id: string) {
  if (state.scenes.length < 2) return
  const i = state.scenes.findIndex(s => s.id === id)
  if (i > -1) {
    state.scenes.splice(i, 1)
    state.shots = state.shots.filter(s => s.sceneId !== id)
  }
}
