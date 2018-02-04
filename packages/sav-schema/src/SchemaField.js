import {SchemaBase} from './SchemaBase.js'
import {SchemaRequiredError, SchemaTypeError, SchemaCheckedError, SchemaEqlError, SchemaEmptyError} from './SchemaError.js'
import {isNull} from 'sav-util'

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
    let {name, nullable, empty, eql, optional, message} = this.opts
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
      // let rule = applyCheckValue(val, this.checks)
      // if (rule) {
      //   throw new SchemaCheckedError(name, rule[0])
      // }
      val = checkValue(val, opts, ref)
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
  if (ref.validate) {
    return ref.validate(val, opts)
  }
  if (ref.parse) {
    val = ref.parse(val)
  }
  if (!ref.check(val)) {
    throw new SchemaTypeError(ref.name, val)
  }
  return val
}
