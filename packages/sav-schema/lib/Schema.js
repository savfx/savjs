import {isObject, isArray} from 'sav-util'
import {declareTypes} from './register.js'
import {createSchema} from './parser.js'

export class Schema {
  constructor (opts) {
    this.opts = Object.assign({
      strict: true
    }, opts)
    declareTypes(this)
  }
  get isStrict () {
    return this.opts.strict
  }
  export (struct) {
    this[struct.name] = struct
  }
  declare (opts, root) {
    if (isArray(opts)) {
      return opts.map(it => this.declare(it))
    } else if (isObject(opts)) {
      let ret = createSchema(this, opts, root)
      return ret
    }
  }
  delay (fn) {
    if (this._promise) {
      this._promise.queue(fn)
    } else {
      let promise = {
        promise: Promise.resolve().then(() => {
          delete this._promise
          let ret = Promise.resolve()
          promise.queues.forEach((fn) => ret.then(fn))
          return ret
        }),
        queues: [fn],
        queue (fn) {
          promise.queues.push(fn)
          return promise
        }
      }
      this._promise = promise
    }
  }
  ready (fn) {
    if (this._promise) {
      return fn ? this._promise.promise.then(fn) : this._promise.promise
    } else {
      return Promise.resolve().then(fn)
    }
  }
}
