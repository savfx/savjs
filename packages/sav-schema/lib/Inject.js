import {SchemaArray} from './SchemaArray.js'
import {SchemaStruct} from './SchemaStruct.js'
import {isObject, isArray} from 'sav-util'
import {SCHEMA_ARRAY} from './consts.js'

let injects = {
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
  createRequest (obj) {
    return this.create(createInput(this, obj || this.opts.req))
  },
  createResponse (obj) {
    return this.create(createInput(this, obj || this.opts.res))
  },
  getOpt (name) {
    return this.opts[name]
  }
}

function createInput (self, obj) {
  let ret
  if (self.schemaType === SCHEMA_ARRAY) {
    ret = isArray(obj) ? JSON.parse(JSON.stringify(obj)) : []
  } else {
    ret = isObject(obj) ? JSON.parse(JSON.stringify(obj)) : {}
  }
  return ret
}

[SchemaArray, SchemaStruct].forEach(it => Object.assign(it.prototype, injects))
