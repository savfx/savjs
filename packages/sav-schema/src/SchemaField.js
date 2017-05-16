import {isArray} from 'sav-util'
import {SchemaRequiredError, SchemaTypeError, SchemaEnumError} from './SchemaError.js'
import {SCHEMA_STURCT, SCHEMA_ENUM, SCHEMA_TYPE} from './util.js'

/*
{
  name: 'followers',

  type: 'Array',      // 可能未定义
  subTef: 'User',
  ref: Array,
  subRef: User,

  required: false,
  optional: true,
}
 */
export class SchemaField {
  constructor (props, struct) {
    Object.assign(this, props)
    this.struct = struct
  }
  create (value) {
    let ret = arguments.length ? this.ref.create(value) : this.ref.create()
    if (isArray(ret) && ret.length && this.type === 'Array' && this.subRef) {
      ret = ret.map((item) => this.subRef.create(item))
    }
    return ret
  }
  validate (obj) {
    let {name, type, required, nullable, ref} = this
    if (!required && !(name in obj)) {
      return
    }
    if (nullable && isNull(obj[name])) {
      return
    }
    if (!(name in obj)) {
      throw new SchemaRequiredError(name)
    }
    let val = obj[name]
    if (ref.schemaType === SCHEMA_STURCT) {
      val = ref.validate(val)
    } else {
      if (!ref.check(val)) {
        if (ref.parse) {
          val = ref.parse(val)
        }
        if (!ref.check(val)) { // 仍然失败
          if (ref.schemaType === SCHEMA_ENUM) {
            throw new SchemaEnumError(name, val)
          } else if (ref.schemaType === SCHEMA_TYPE) {
            throw new SchemaTypeError(name, val)
          }
        }
      }
    }
    const {subType, subRef} = this
    if (subType) {
      if (type === 'Array') {
        for (let i = 0, l = val.length; i < l; ++i) {
          try {
            if (subRef.extract) {
              ret.push(subRef.extract(val[i]))
            } else { // no Struct
              let subVal = checkValue(struct, val[i], subRef)
              ret.push(subVal)
            }
          } catch (err) {
            (err.keys || (err.keys = [])).unshift(i)
            throw err
          }
        }
      }
    }
  }
}
