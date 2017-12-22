import {SCHEMA_REFER} from './consts.js'
import {prop} from 'sav-util'

export class SchemaRefer {
  constructor (schema, opts, root) {
    this.schemaType = SCHEMA_REFER
    this.opts = opts
    prop(this, {
      schema,
      root: root || this
    })
    if (this.name) {
      schema.export(this)
    }
    let {refer} = this.opts
    let ref = schema[refer]
    if (ref) {
      this.setRef(ref)
    } else {
      schema.delay(() => {
        this.setRef(schema[refer])
      })
    }
  }
  setRef (ref) {
    prop(this, 'ref', ref)
  }
  create (value) {
    return this.ref.create(value)
  }
  validate (obj, opts) {
    return this.ref.validate(obj, opts)
  }
  get name () {
    return this.opts.name
  }
}
