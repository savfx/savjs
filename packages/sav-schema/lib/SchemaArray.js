import {isString, isObject, isArray, isNull, isUndefined, prop} from 'sav-util'
import {SchemaTypeError} from './SchemaError.js'
import {arrayVal} from './types.js'
import {SCHEMA_ARRAY} from './consts.js'

export class SchemaArray {
  constructor (schema, opts, root) {
    prop(this, {
      schema,
      root: root || this,
      refs: root ? root.refs : {}
    })
    this.schemaType = SCHEMA_ARRAY
    this.opts = opts
    let {array, refs} = opts
    if (refs) {
      this.addRefs(refs)
    }
    let ref
    if (isObject(array)) {
      ref = this.addRef(array)
    } else if (isString(array)) {
      ref = this.refs[array] || schema[array]
    }
    if (ref) {
      this.setRef(ref)
    } else {
      schema.delay(() => {
        this.setRef(schema[array])
      })
    }
  }
  setRef (ref) {
    prop(this, 'ref', ref)
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
  validate (obj, inPlace, fields) {
    let {required, ref, opts} = this
    let {name, nullable} = opts
    if (nullable && isNull(obj)) {
      return
    }
    if (!required && !obj) {
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
          let newIt = ref.validate ? ref.validate(val[i], inPlace, fields) : checkValue(val[i], ref)
          ret.push(isUndefined(newIt) ? val[i] : newIt)
        } catch (err) {
          (err.keys || (err.keys = [])).unshift(i)
          throw err
        }
      }
      return inPlace ? obj : ret
    } catch (err) {
      if (this.opts.message) {
        err.message = this.opts.message
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
