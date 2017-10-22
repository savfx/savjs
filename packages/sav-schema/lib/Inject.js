import {SchemaArray} from './SchemaArray.js'
import {SchemaStruct} from './SchemaStruct.js'
import {isObject, isArray} from 'sav-util'
import {SCHEMA_ARRAY} from './consts.js'

let injects = {
  check (obj) {
    return this.validate(obj, true)
  },
  checkThen (obj) {
    return Promise.resolve().then(() => this.check(obj))
  },
  extract (obj) {
    return this.validate(obj, false)
  },
  extractThen (obj) {
    return Promise.resolve().then(() => this.extract(obj))
  },
  createRequest (obj) {
    return this.create(createInput(this, obj || this.opts.req))
  },
  createResponse (obj) {
    return this.create(createInput(this, obj || this.opts.res))
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
