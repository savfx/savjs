import {SchemaEnum} from './SchemaEnum.js'
import {SchemaType} from './SchemaType.js'
import {SchemaStruct} from './SchemaStruct.js'
import {defaultSchemas} from './defaultSchema.js'
import {isObject, isArray} from 'sav-util'

const defaultTypes = []

export class Schema {
  constructor (opts) {
    this.opts = Object.assign({
      strict: true
    }, opts)
    this.declare(defaultTypes)
  }
  get isStrict () {
    return this.strict
  }
  static register (opts) {
    if (isArray(opts)) {
      defaultTypes.push.apply(defaultTypes, opts)
    } else if (isObject(opts)) {
      defaultTypes.push(opts)
    }
  }
  export (struct) {
    this[struct.name] = struct
  }
  declare (opts) {
    if (isArray(opts)) {
      return opts.map(it => this.declare(it))
    } else if (isObject(opts)) {
      let ret = createSchemaType(this, opts)
      return ret
    }
  }
}

function createSchemaType (schema, opts) {
  let struct
  if (opts.enums) {
    struct = new SchemaEnum(opts, schema)
  } else if (opts.props) {
    struct = new SchemaStruct(opts, schema)
  } else {
    struct = new SchemaType(opts, schema)
  }
  return struct
}

Schema.register(defaultSchemas)
