import pathToRegexp from 'path-to-regexp'
import {isString, convertCase, pascalCase, isArray, isObject, bindEvent} from 'sav-util'

export class Router {
  constructor (opts) {
    this.opts = {
      prefix: '',
      caseType: 'camel',
      sensitive: true,
      method: 'POST'
    }
    opts && this.setOptions(opts)
    this.modalMap = {}
    this.modalRoutes = []
    this.absoluteRoutes = createMethods({}) // 绝对路径路由
    bindEvent(this)
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  declare (target) {
    if (target.modal) {
      return this.createActionRoute(target)
    }
    return this.createModalRoute(target)
  }
  load ({modals, actions}) {
    if (isObject(modals)) { // 兼容 decorator
      for (let name in modals) {
        let it = modals[name]
        it.name = name
        this.declare(it)
      }
    } else if (isArray(modals)) {
      modals.forEach(it => this.declare(it))
    }
    if (isArray(actions)) {
      actions.forEach(it => this.declare(it))
    }
  }
  createModalRoute (opts) {
    let route = {
      name: pascalCase(opts.name),
      path: convertCase(this.opts.caseType, opts.name),
      opts,
      keys: [],
      childs: createMethods({})
    }
    let path = isString(opts.path) ? opts.path : route.path
    route.path = normalPath('/' + path)
    route.regexp = pathToRegexp(route.path, route.keys, {
      sensitive: this.opts.sensitive,
      end: false
    })
    this.modalMap[opts.name] = route
    if (opts.id) {
      this.modalMap[opts.id] = route
    }
    this.modalRoutes.push(route)
    this.emit('declareModal', route)
    // 兼容 decorator
    if (isArray(opts.routes)) {
      opts.routes.forEach(it => {
        it.modal = opts.name || opts.id
        this.declare(it)
      })
    } else if (isObject(opts.routes)) {
      for (let name in opts.routes) {
        let it = opts.routes[name]
        it.modal = opts.name || opts.id
        it.name = name
        this.declare(it)
      }
    }
    return route
  }
  createActionRoute (opts) {
    let modal = this.modalMap[opts.modal]
    let route = {
      name: modal.name + pascalCase(opts.name),
      path: modal.path + '/' + convertCase(this.opts.caseType, opts.name),
      opts: opts,
      method: opts.method || (modal.view ? 'GET' : (this.opts.method || 'POST')),
      modal,
      keys: []
    }
    let isAbsolute = false
    let path = isString(opts.path) ? opts.path : route.path
    if (path && path[0] === '/') {
      isAbsolute = true
    } else {
      path = modal.path + '/' + opts.path
    }
    route.path = normalPath(path)
    route.regexp = pathToRegexp(route.path, route.keys, {
      sensitive: this.opts.sensitive,
      end: true
    })
    route.isAbsolute = isAbsolute
    if (isAbsolute) {
      this.absoluteRoutes[route.method].push(route)
      this.absoluteRoutes['ANY'].push(route)
    } else {
      modal.childs[route.method].push(route)
      modal.childs['ANY'].push(route)
    }
    this.emit('declareAction', route)
    return route
  }
  matchRoute (path, method) {
    method = method.toUpperCase()
    if (method === 'OPTIONS') {
      method = 'ANY'
    }
    if (methods.indexOf(method) === -1) {
      return
    }
    path = stripPrefix(path, this.opts.prefix)
    let ret = {
      path
    }
    // 顶级路由
    for (let route of this.absoluteRoutes[method]) {
      if (matchRoute(route, path, ret)) {
        return ret
      }
    }
    for (let route of this.modalRoutes) {
      // 模块路由
      if (matchRoute(route, path)) {
        for (let subRoute of route.childs[method]) {
          // 子级路由
          if (matchRoute(subRoute, path, ret)) {
            return ret
          }
        }
      }
    }
  }
}

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ANY']

function createMethods (target) {
  methods.forEach((name) => {
    target[name] = []
  })
  return target
}

function normalPath (path) {
  return path.replace(/\/+/g, '/')
}

function matchRoute (route, path, ret) {
  let mat = path.match(route.regexp)
  if (mat) {
    if (ret) {
      ret.route = route
      let {keys} = route
      let params = ret.params = {}
      for (let i = 1, len = mat.length; i < len; ++i) {
        const key = keys[i - 1]
        if (key) {
          const val = typeof mat[i] === 'string' ? decodeURIComponent(mat[i]) : mat[i]
          params[key.name] = val
        }
      }
    }
    return true
  }
}

export function stripPrefix (src, prefix) {
  if (prefix) {
    let pos = src.indexOf(prefix)
    if (pos === 0 || ((pos === 1) && src[0] === '/')) {
      src = src.substr(pos + prefix.length, src.length)
      if (src[0] !== '/') {
        src = '/' + src
      }
      return src
    }
  }
  return src
}
