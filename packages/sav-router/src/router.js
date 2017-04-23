import {EventEmitter} from 'events'
import {routerPlugin} from './plugin'
import compose from 'koa-compose'
import {isPromise, isAsync, isFunction, makeProp} from 'sav-util'

export class Router extends EventEmitter {
  constructor (opts) {
    super()
    this.opts = {...opts}
    this.matchRoute = null
    this.payloads = []
    if (!this.opts.noRoute) {
      this.use(routerPlugin)
    }
  }
  config (name, dval) {
    return name in this.opts ? this.opts[name] : dval
  }
  use (plugin) {
    if (typeof plugin === 'function') {
      plugin(this)
    } else if (typeof plugin === 'object') {
      for (let name in plugin) {
        if (name === 'payload') {
          this.payloads.push(plugin[name])
        } else {
          this.on(name, plugin[name])
        }
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
    let payloads = [payloadStart.bind(this)].concat(this.payloads).concat([payloadEnd.bind(this)])
    let payload = compose(payloads)
    return payload
  }
  async exec (ctx) {
    if (this._executer) {
      return await this._executer(ctx)
    }
    this._executer = this.route()
    return await this._executer(ctx)
  }
  warn (...args) {
    this.emit('warn', ...args)
  }
}

function buildModules (ctx, modules) {
  for (let module of modules) {
    let prop = makeProp(module, false)
    prop({
      ctx
    })
    ctx.emit('module', module)
    for (let actionName in module.actions) {
      let action = module.actions[actionName]
      let prop = makeProp(action, false)
      prop({
        module,
        ctx,
        middlewares: action.config.map(([name]) => {
          return {name}
        }),
        set (name, middleware) {
          for (let it of action.middlewares) {
            if (it.name === name) {
              it.middleware = middleware
              return
            }
          }
          action.middlewares.push({name, middleware})
        },
        get (name) {
          for (let it of action.middlewares) {
            if (it.name === name) {
              return it
            }
          }
        }
      })
      ctx.emit('action', action)
    }
  }
}

async function payloadStart (ctx, next) {
  let prop = makeProp(ctx)
  prop({
    stack: [],
    end (data, name) {
      ctx.stack.push({name, data})
    }
  })
  prop.getter('data', (data, name) => {
    let ret = ctx.stack[ctx.stack.length - 1]
    return ret && ret.data
  })
  await next()
}

async function payloadEnd (ctx, next) {
  let method = ctx.method.toUpperCase()
  let path = ctx.path || ctx.originalUrl
  let matched = this.matchRoute(path, method)
  if (matched) {
    let [route, params] = matched
    let {prop} = ctx
    prop({
      params,
      route
    })
    for (let {name, middleware} of route.middlewares) {
      if (isFunction(middleware)) {
        let ret
        if (isAsync(middleware)) {
          ret = await middleware(ctx)
        } else {
          ret = middleware(ctx)
          if (ret && isPromise(ret)) {
            ret = await ret
          }
        }
        if (name === 'route') {
          ctx.end(ret, name)
        }
      }
    }
    ctx.body = ctx.data
  } else {
    await next()
  }
}
