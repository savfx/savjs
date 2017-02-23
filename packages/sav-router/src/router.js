import {convertCase} from './caseconvert.js'
import {matchRouters} from './matchs.js'

export class Router {
  constructor (opts) {
    this.opts = {...opts}
    this.providers = {}
    this.actions = []
    this.plugins = []
    this.routers = []
    this.routerMaps = {}
    this.use(routePlugin)
  }
  provider (providers) {
    this.providers = {...this.providers, ...providers}
  }
  declare (actions) {
    if (Array.isArray(actions)) {
      this.actions = this.actions.concat(actions)
    } else {
      this.actions.push(actions)
    }
    walkPlugins(this, actions)
  }
  compile () {
    createMiddlewares(this)
  }
  use (fn) {
    this.plugins.push(fn(this))
  }
  matchRoute (pathname, method) {
    let route = matchRouters(this.routers, pathname, method)
    if (route) {
      if (route.childs) {
        return matchRouters(route.childs, pathname, method)
      }
    }
    return route
  }
  getModuleRoute (moduleName) {
    return this.routerMaps[moduleName]
  }
  addModuleRoute (moduleName, route) {
    route.childs = []
    route.moduleName = moduleName
    this.routers.push(route)
    this.routerMaps[moduleName] = route
  }
  addActionRoute (moduleName, route) {
    route.moduleName = moduleName
    let path = route.path
    if (path[0] === '/') {
      this.routers.push(route)
    } else {
      let moduleRoute = this.routerMaps[moduleName]
      route.path = moduleRoute.path + (route.path ? ('/' + route.path) : '')
      moduleRoute.childs.push(route)
    }
  }
}

function createMiddlewares (router, module) {
  const providers = router.providers
  for (let action of module.actions) {
    let middlewares = []
    for (let config of action.options) {
      let [name, ...args] = config
      if (providers[name]) {
        let middleware = providers[name]({router, module, action, name, args})
        if (typeof middleware === 'function') {
          middlewares.push({name, middleware})
        }
      }
    }
    action.middlewares = middlewares
  }
}

function walkPlugins (router, actions) {
  for (let module of actions) {
    for (let plugin of router.plugins) {
      plugin(router, module)
    }
    createMiddlewares(router, module)
  }
}

function routePlugin (router) {
  router.provider({
    route: routeProvider
  })
  return (router, module) => {
    let moduleName = module.name
    let route = module.options.route || {}
    route.path = convertPath(route.path, router.opts.case, moduleName)
    router.addModuleRoute(moduleName, route)
  }
}

function routeProvider ({router, module, action, name, args}) {
  router.addActionRoute({
    actionName: action.name,
    path: convertPath(args[1], router.opts.case, action.name),
    methods: args[0] || []
  })
  return async () => {

  }
}

function convertPath (path, caseType, name) {
  if (typeof path !== 'string') {
    if (caseType) {
      path = convertCase(caseType, name)
    } else {
      path = name
    }
  }
  return path
}
