import {isString, isNull, isUndefined, prop} from 'sav-util'
import {SchemaRequiredError, SchemaTypeError, SchemaCheckedError} from './SchemaError.js'
import {applyCheckValue} from './register.js'

export class SchemaField {
  constructor (schema, opts, root) {
    this.opts = opts
    let ref
    let {type, array, props} = opts
    if (isString(type)) {
      ref = root.refs[type] || schema[type]
    } else if (array) {
      ref = schema.declare({array}, root)
    } else if (props) {
      ref = schema.declare({props}, root)
    }
    prop(this, {
      root,
      ref
    })
    // 延时加载
    if (!this.ref) {
      if (type) {
        schema.delay(() => {
          prop(this, 'ref', schema[type])
        })
      }
    }
  }
  create (value) {
    let ret = arguments.length ? this.ref.create(value) : this.ref.create()
    return ret
  }
  validate (obj, inPlace) {
    let {required, ref, opts} = this
    let {name, nullable} = opts
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
      let val = obj[name]
      let rule = applyCheckValue(val, this.checkes)
      if (rule) {
        throw new SchemaCheckedError(name, rule[0])
      }
      if (ref.validate) {
        val = ref.validate(val, inPlace)
      } else {
        val = checkValue(val, ref)
      }
      return val
    } catch (err) {
      if (this.message) {
        err.message = this.message
      }
      throw err
    }
  }
  get required () {
    let {required, optional} = this.opts
    return isUndefined(required) ? !optional : required
  }
  get name () {
    return this.opts.name
  }
  get checkes () {
    return this.opts.checkes
  }
}

function checkValue (val, ref) {
  if (ref.parse) {
    val = ref.parse(val)
  }
  if (!ref.check(val)) {
    throw new SchemaTypeError(ref.name, val)
  }
  return val
}
