import {SchemaArray} from './SchemaArray.js'
import {SchemaStruct} from './SchemaStruct.js'
import {SchemaRefer} from './SchemaRefer.js'

[SchemaArray, SchemaStruct, SchemaRefer].forEach(it => Object.assign(it.prototype, {
  check (obj, opts) {
    return this.validate(obj, opts || {})
  },
  checkThen (obj, opts) {
    return Promise.resolve().then(() => this.check(obj, opts))
  },
  extract (obj, opts) {
    if (!opts) {
      opts = {}
    }
    opts.extract = true
    return this.validate(obj, opts)
  },
  extractThen (obj, opts) {
    return Promise.resolve().then(() => this.extract(obj, opts))
  },
  getOpt (name) {
    return this.opts[name]
  }
}))
