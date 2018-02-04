import {SchemaControl} from './SchemaControl.js'

export class SchemaRefer extends SchemaControl {
  create (value) {
    return this.ref.create(value)
  }
  validate (obj, opts) {
    return this.ref.validate(obj, opts)
  }
}
