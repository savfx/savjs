import {SchemaBase} from './SchemaBase.js'

export class SchemaControl extends SchemaBase {
  check (obj, opts) {
    return this.validate(obj, opts || {})
  }
  checkThen (obj, opts) {
    return Promise.resolve().then(() => this.check(obj, opts))
  }
  extract (obj, opts = {}) {
    opts.extract = true
    return this.validate(obj, opts)
  }
  extractThen (obj, opts) {
    return Promise.resolve().then(() => this.extract(obj, opts))
  }
}
