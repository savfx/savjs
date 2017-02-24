import {convertCase} from './caseconvert.js'
import {matchRouters} from './matchs.js'

const CASE_TYPE = 'case'
export const CONTAINER_KEY = 'container'

export class RouteContainer {
  constructor () {
    this.routers = []
    this.routerMaps = {}
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
  initModule (router, module) {
    let moduleName = module.name
    let route = module.options.route || {}
    route.path = convertPath(route.path, router.config(CASE_TYPE), moduleName)
    router.container.addModuleRoute(moduleName, route)
  }
  providerModule ({router, module, action, name, args}) {
    let self = router.container
    self.addActionRoute(module.name, {
      actionName: action.name,
      path: convertPath(args[1], router.config(CASE_TYPE), action.name),
      methods: args[0] || []
    })
    return exeAction
  }
}

async function exeAction (ctx) {
  await ctx.route.action(ctx)
}

export function connectRouter (router) {
  let self = new RouteContainer()
  router.container = self
  router.provider({route: self.providerModule})
  return self.initModule
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
