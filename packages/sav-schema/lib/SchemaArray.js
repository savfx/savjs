import {isString, isObject, isArray, isNull, isUndefined, prop} from 'sav-util'
import {SchemaTypeError} from './SchemaError.js'
import {arrayVal} from './types.js'

export class SchemaArray {
  constructor (schema, opts, root) {
    prop(this, {
      schema,
      root: root || this,
      refs: root ? root.refs : {}
    })
    this.opts = opts
    let {array, refs} = opts
    if (refs) {
      this.addRefs(refs)
    }
    if (isString(array)) {
      this.ref = this.refs[array] || schema[array]
    } else if (isObject(array)) {
      this.ref = this.addRef(array)
    }
    if ((!this.ref) && array) {
      schema.delay(() => {
        prop(this, 'ref', schema[array])
      })
    }
  }
  parse (val) {
    return arrayVal(val)
  }
  create (value) {
    value = this.parse(value)
    if (isArray(value)) {
      return value.map(it => this.ref.create(it))
    }
    return []
  }
  validate (obj, inPlace) {
    let {required, ref, opts} = this
    let {name, nullable} = opts
    if (!required && !obj) {
      return
    }
    if (nullable && isNull(obj)) {
      return
    }
    try {
      let val = this.parse(obj)
      if (!isArray(val)) {
        throw new SchemaTypeError(name || 'Array', val)
      }
      let ret = []
      for (let i = 0, l = val.length; i < l; ++i) {
        try {
          let newIt = ref.validate ? ref.validate(val[i], inPlace) : checkValue(val[i], ref)
          ret.push(isUndefined(newIt) ? val[i] : newIt)
        } catch (err) {
          (err.keys || (err.keys = [])).unshift(i)
          throw err
        }
      }
      return inPlace ? obj : ret
    } catch (err) {
      if (this.message) {
        err.message = this.message
      }
      throw err
    }
  }
  addRefs (refs) {
    for (let ref in refs) {
      this.addRef(refs[ref], ref)
    }
  }
  addRef (ref, name) {
    if ((!ref.name) && ref.export && name) {
      ref.name = name
    }
    let target = this.schema.declare(ref, this.root)
    if (name) {
      this.refs[name] = target
    }
    return target
  }
  get required () {
    let {required, optional} = this.opts
    return isUndefined(required) ? !optional : required
  }
  get name () {
    return this.opts.name
  }
  check (obj) {
    return this.validate(obj, true)
  }
  checkThen (obj) {
    return Promise.resolve().then(() => this.check(obj))
  }
  extract (obj) {
    return this.validate(obj, false)
  }
  extractThen (obj) {
    return Promise.resolve().then(() => this.extract(obj))
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
