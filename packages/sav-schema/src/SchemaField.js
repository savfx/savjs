import {isArray, isNull} from 'sav-util'
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
  message: "用户关注数据非法"
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
  validate (obj, inPlace) {
    let val = checkField(obj, this, inPlace)
    if (this.subRef) {
      val = checkSubField(val, this, inPlace)
    }
    return val
  }
}

function checkSubField (val, struct, inPlace) {
  let {type, subRef, subType} = struct
  // if (!isArray(val)) { // allow Array<Struct> only
  //   throw new SchemaTypeError(type, val)
  // }
  let ret = inPlace ? val : []
  for (let i = 0, l = val.length; i < l; ++i) {
    try {
      let subVal
      if (subRef.schemaType === SCHEMA_STURCT) {
        subVal = subRef.validate(val[i], inPlace)
      } else {
        subVal = checkValue(val[i], subRef, subType)
      }
      ret[i] = subVal
    } catch (err) {
      (err.keys || (err.keys = [])).unshift(i)
      throw err
    }
  }
  return ret
}

function checkField (obj, struct, inPlace) {
  let {name, required, nullable, ref, type} = struct
  if (!required && !(name in obj)) {
    return
  }
  if (nullable && isNull(obj[name])) {
    return
  }
  try {
    if (!(name in obj)) {
      throw new SchemaRequiredError(name)
    }
    // @TODO apply checkes here
    let val = obj[name]
    if (ref.schemaType === SCHEMA_STURCT) {
      val = ref.validate(val, inPlace)
    } else {
      val = checkValue(val, ref, type)
    }
    return val
  } catch (err) {
    if (struct.message) {
      err.message = struct.message
    }
    throw err
  }
}

function checkValue (val, ref, type) {
  if (!ref.check(val)) {
    let pass
    if (ref.parse) {
      pass = ref.check(ref.parse(val))
    }
    if (!pass) { // 仍然失败
      if (ref.schemaType === SCHEMA_ENUM) {
        throw new SchemaEnumError(type, val)
      } else if (ref.schemaType === SCHEMA_TYPE) {
        throw new SchemaTypeError(type, val)
      }
    }
  }
  return val
}