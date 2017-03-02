import {EventEmitter} from 'events'
import {routerPlugin} from './plugin.js'

export class Router extends EventEmitter {
  constructor (opts) {
    super()
    this.opts = {...opts}
    this.matchRoute = null
    if (!this.opts.noRoute) {
      this.use(routerPlugin)
    }
  }
  config (name) {
    return this.opts[name]
  }
  use (plugin) {
    if (typeof plugin === 'function') {
      plugin(this)
    } else if (typeof plugin === 'object') {
      for (let name in plugin) {
        this.on(name, plugin[name])
      }
    }
  }
  declare (modules) {
    if (!Array.isArray(modules)) {
      modules = [modules]
    }
    buildModules(this, modules)
  }
  route () {
    let self = this
    return async (ctx, next) => {
      await self.dispatch(ctx, next)
    }
  }
  async dispatch (ctx, next) {
    let method = ctx.method.toUpperCase()
    let path = ctx.path || ctx.originalUrl
    let matched = this.matchRoute(path, method)
    if (matched) {
      let [route, params] = matched
      ctx.params = params
      for (let middleware of route.middlewares) {
        await middleware(ctx)
      }
    } else {
      await next()
    }
  }
}

function buildModules (ctx, modules) {
  let moduleCtx = {ctx}
  for (let module of modules) {
    ctx.emit('module', module, moduleCtx)

    let actionCtx = {ctx, module}
    for (let actionName in module.actions) {
      let action = module.actions[actionName]
      let middlewares = []
      ctx.emit('action', action, actionCtx)

      let middlewareCtx = {ctx, module, action, middlewares}
      for (let middleware of action.middleware) {
        let [name, ...args] = middleware
        ctx.emit('middleware', {name, args}, middlewareCtx)
      }
    }
  }
}
