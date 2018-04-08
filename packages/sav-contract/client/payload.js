import {isString, isObject, isArray, isFunction, clone} from 'sav-util'

export function getPayloads (route, {Vue, router, deepth}) {
  let components = router.getMatchedComponents(route)
  let arr = []
  getComponentsDepth(Vue, components, deepth, arr)
  let payloads = []
  arr.reduce(processComponent, payloads)
  return resolvePayloads(route, payloads)
}

function resolvePayloads (vueRoute, payloads) {
  return clone(payloads.reduce((routes, payload) => {
    if (isFunction(payload)) {
      payload = payload(vueRoute)
    }
    if (isObject(payload)) { // 单个
      routes.push(payload)
    } else if (isArray(payload)) { // 多个
      return routes.concat(payload.map(it => {
        if (isString(it)) { // 简单字符串
          it = {name: it}
        }
        return it
      }).filter(it => isObject(it)))
    } else if (isString(payload)) { // 简单字符串
      routes.push({name: payload})
    }
    return routes
  }, []))
}

function processComponent (payloads, component) {
  let options = typeof component === 'object' ? component : component.options
  if (options.payload) {
    payloads.push(options.payload)
  }
  return payloads
}

function getComponentsDepth (Vue, components, depth, arr) {
  if (Array.isArray(components)) {
    for (let i = 0; i < components.length; ++i) {
      appendComponent(Vue, components[i], depth, arr)
    }
  } else {
    for (let comName in components) {
      appendComponent(Vue, components[comName], depth, arr)
    }
  }
}

function appendComponent (Vue, com, depth, arr) {
  if (isString(com)) {
    com = Vue.component(com)
  }
  if (com) {
    arr.push(com)
    if (depth && com.components) {
      getComponentsDepth(Vue, com.components, depth--, arr)
    }
  }
}
