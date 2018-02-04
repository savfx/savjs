import {SchemaControl} from './SchemaControl.js'
import {arrayVal} from './types.js'
import {isArray, isUndefined} from 'sav-util'
import {SchemaTypeError} from './SchemaError.js'

/*
{
  name: 'Users',
  list: 'String'
}
 */

export class SchemaList extends SchemaControl {
  parse (val) {
    return arrayVal(val)
  }
  create (value) {
    value = this.parse(value)
    if (isArray(value)) {
      let ref = this.ref
      return value.map(it => ref.create(it))
    }
    return []
  }
  validate (obj, opts) {
    let {ref} = this
    let {name} = this.opts
    let {extract, replace} = opts
    let val = this.parse(obj)
    if (!isArray(val)) {
      throw new SchemaTypeError(name || 'list', val)
    }
    let ret = []
    for (let i = 0, l = val.length; i < l; ++i) {
      try {
        let newIt = checkValue(val[i], opts, ref)
        if (extract) {
          ret.push(!isUndefined(newIt) ? val[i] : newIt)
        }
        if (replace) {
          if (!isUndefined(newIt)) {
            val[i] = newIt
          }
        }
      } catch (err) {
        (err.keys || (err.keys = [])).unshift(i)
        throw err
      }
    }
    return extract ? ret : obj
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
