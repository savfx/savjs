import {connectRouter} from './container.js'

export class Router {
  constructor (opts) {
    opts = this.opts = opts || {}
    this.providers = {}
    this.modules = []
    this.plugins = []
    if (!opts.noContainer) {
      this.use(connectRouter)
    }
  }
  use (fn) {
    this.plugins.push(fn(this))
  }
  provider (providers) {
    this.providers = {...this.providers, ...providers}
  }
  declare (modules) {
    if (Array.isArray(modules)) {
      this.modules = this.modules.concat(modules)
    } else {
      this.modules.push(modules)
    }
    walkPlugins(this, modules)
  }
  config (name) {
    return this.opts[name]
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
