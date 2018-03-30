import {SchemaBase} from './SchemaBase.js'
import {SchemaRequiredError, SchemaTypeError, SchemaCheckedError, SchemaEqlError, SchemaEmptyError} from './SchemaError.js'
import {isNull, isArray, isString} from 'sav-util'

/*
{
  name: 'userName',
  type: String,
  *nullable: true,
  *empty: false,
  *required: false,
  *trim: false
  *eql: 'userName2'
}
 */

export class SchemaField extends SchemaBase {
  create (val) {
    let ret = this.ref.create(val)
    return ret
  }
  validate (obj, opts) {
    let {ref} = this
    let {name, nullable, optional, message} = this.opts
    if (optional && !(name in obj)) {
      return
    }
    if (nullable && isNull(obj[name])) {
      return
    }
    try {
      if (!(name in obj)) {
        throw new SchemaRequiredError(name)
      }
      let {empty, eql, checks, len, min, max} = this.opts
      let val = obj[name]
      if (!empty && !isNull(val)) {
        if (val === '') {
          throw new SchemaEmptyError(name)
        }
      }
      if (eql) {
        let eqlVal = obj[eql]
        if (eqlVal !== val) {
          throw new SchemaEqlError(name, eql)
        }
      }
      val = checkValue(val, opts, ref)
      // len 字符串或数组长度
      // min, max 数字区间, 或字符串数组长度
      if (len || min || max) {
        let valLen = (isArray(val) || isString(val)) ? val.length : val
        if (len && (valLen !== len)) {
          throw new SchemaCheckedError(name, 'len')
        }
        if (min && (valLen < min)) {
          throw new SchemaCheckedError(name, 'min')
        }
        if (max && (valLen > max)) {
          throw new SchemaCheckedError(name, 'max')
        }
      }
      let rule = this.schema.applyChecks(val, checks)
      if (rule) {
        throw new SchemaCheckedError(name, rule[0])
      }
      return val
    } catch (err) {
      if (message) {
        err.message = message
      }
      throw err
    }
  }
}

function checkValue (val, opts, ref) {
  if (ref.parse) {
    val = ref.parse(val)
  }
  if (ref.validate) {
    return ref.validate(val, opts)
  }
  if (!ref.check(val)) {
    throw new SchemaTypeError(ref.name, val)
  }
  return val
}
