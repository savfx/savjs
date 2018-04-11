import {ajax, bindEvent, compose, testAssign} from 'sav-util'

import {
  REQUEST,
  RESPONSE
} from './events.js'

export class Request {
  constructor (opts = {}) {
    this.opts = testAssign(opts, {
      baseUrl: '/',
      stripHeaders: true, // 不返回头部信息
      ajax
    })
    this.invokeQueues = [this.invoke.bind(this)]
    this.invoker = null
    bindEvent(this)
  }
  insert (fn) {
    this.invoker = null
    this.invokeQueues.unshift(fn)
  }
  append (fn) {
    this.invoker = null
    this.invokeQueues.push(fn)
  }
  request (options) {
    options = assign({
      url: '',
      dataType: 'JSON',
      headers: {
        Accept: 'application/json'
      }
    }, options)
    let {stripHeaders, baseUrl} = this.opts
    if ('stripHeaders' in options) {
      stripHeaders = options.stripHeaders
    }
    if (!/^(http(s?):)?\/\//i.test(options.url)) {
      options.url = baseUrl + options.url.replace(/^\//, '')
    }
    if (!this.invoker) {
      this.invoker = compose(this.invokeQueues)
    }
    let {invoker} = this
    let ctx = {request: options}
    return invoker(ctx).then(() => stripHeaders ? ctx.response.data : ctx.response)
  }
  invoke (ctx, next) {
    return new Promise((resolve, reject) => {
      ctx.xhr = this.opts.ajax(ctx.request, (err, data, headers) => {
        if (err) {
          return reject(err)
        }
        try {
          ctx.response = {
            data,
            headers
          }
          this.emit(RESPONSE, ctx)
        } catch (err) {
          return reject(err)
        }
        resolve()
      })
      this.emit(REQUEST, ctx)
    }).then(next)
  }
}

function assign (target, opts) {
  return Object.assign(target, opts)
}
