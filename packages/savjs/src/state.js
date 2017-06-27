
export function makeState (target) {
  let state = {}
  return Object.assign(target || {}, {
    get state () {
      return state
    },
    cloneState () {
      return Promise.resolve().then(() =>clone(state))
    },
    updateState (newState) {
      Object.assign(state, newState)
      return Promise.resolve().then(() =>clone(newState))
    },
    replaceState (newState) {
      state = newState
      return Promise.resolve().then(() => newState)
    }
    patchState (paths, newValue) {
      // patchState('a.b[c][d].e' , {})

    }
  })
}

function clone (value) {
  return JSON.parse(JSON.stringify(value))
}
