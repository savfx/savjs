import {isString, isNull, isUndefined, prop} from 'sav-util'
import {SchemaRequiredError, SchemaTypeError, SchemaCheckedError} from './SchemaError.js'
import {applyCheckValue} from './register.js'

export class SchemaField {
  constructor (schema, props, root) {
    this.props = props
    let ref
    let {type} = props
    if (isString(type)) {
      ref = root.refs[type] || schema[type]
    }
    prop(this, {
      root,
      ref
    })
    if ((!this.ref) && type) {
      schema.delay(() => {
        prop(this, 'ref', schema[type])
      })
    }
  }
  create (value) {
    let ret = arguments.length ? this.ref.create(value) : this.ref.create()
    return ret
  }
  validate (obj, inPlace) {
    let {required, ref, props} = this
    let {name, nullable} = props
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
    let {required, optional} = this.props
    return isUndefined(required) ? !optional : required
  }
  get name () {
    return this.props.name
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
