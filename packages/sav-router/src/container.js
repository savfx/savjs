import {convertCase} from './caseconvert.js'
import {matchRouters} from './matchs.js'

const CASE_TYPE = 'case'
const ROUTE_PREFIX = 'prefix'

export class RouteContainer {
  constructor () {
    this.routers = []
    this.routerMaps = {}
    this.prefix = '/'
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
    route.path = this.prefix + route.path
    route.childs = []
    route.moduleName = moduleName
    this.routers.push(route)
    this.routerMaps[moduleName] = route
  }
  addActionRoute (moduleName, route) {
    route.moduleName = moduleName
    let prefix = this.prefix
    let path = route.path
    if (path[0] === '/') { // absolute
      this.routers.push(route)
    } else if (path[0] === '~') { // relative to root
      route.path = prefix + path.substr(1, path.length)
      this.routers.push(route)
    } else {
      let moduleRoute = this.routerMaps[moduleName]
      route.path = moduleRoute.path + (route.path ? ('/' + route.path) : '')
      moduleRoute.childs.push(route)
    }
  }
}

export function routePlugin (router) {
  let self = new RouteContainer()
  router.container = self
  router.provider({route: processAction})
  return processModule
}

function processModule (router, module) {
  let moduleName = module.name
  let route = module.props.route || {}
  let container = router.container
  let prefix = router.config(ROUTE_PREFIX)
  if (typeof prefix === 'string') {
    container.prefix = prefix
  } else {
    prefix = container.prefix
  }
  route.path = convertPath(route.path, router.config(CASE_TYPE), moduleName)
  container.addModuleRoute(moduleName, route)
}

function processAction ({router, module, action, name, args}) {
  let self = router.container
  self.addActionRoute(module.name, {
    actionName: action.name,
    path: convertPath(args[1], router.config(CASE_TYPE), action.name),
    methods: args[0] || []
  })
  return dispatchRoute
}

async function dispatchRoute (ctx) {
  await ctx.route.method(ctx)
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
