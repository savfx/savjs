import {SCHEMA_STURCT} from './consts.js'
import {SchemaField} from './SchemaField.js'
import {isString, isArray, isObject, isUndefined, prop} from 'sav-util'

export class SchemaStruct {
  constructor (schema, opts, root) {
    this.schemaType = SCHEMA_STURCT
    this.fields = []
    this.fieldMap = {}
    this.opts = opts
    prop(this, {
      schema,
      root: root || this,
      refs: root ? root.refs : {}
    })
    if (this.name) {
      schema.export(this)
    }
    let {refs, props} = opts
    if (refs) {
      this.addRefs(refs)
    }
    if (isArray(props)) {
      props.forEach((it) => this.addField(it))
    } else {
      for (let prop in props) {
        this.addField(props[prop], prop)
      }
    }
  }
  addField (value, name) {
    if (isString(value)) {
      value = {
        type: value
      }
    }
    if (name) {
      value.name = name
    }
    if (value.refs) {
      this.addRefs(value.refs)
    }
    let field = new SchemaField(this.schema, value, this)
    this.fields.push(field)
    this.fieldMap[field.name] = field
  }
  getField (name) {
    return this.fieldMap[name]
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
  }
  create (obj) {
    let isObj = isObject(obj)
    let struct = isObj ? obj : {}
    this.fields.forEach((it) => {
      struct[it.name] = isObj && (it.name in obj) ? it.create(obj[it.name]) : it.create()
    })
    return struct
  }
  validate (obj, inPlace) {
    try {
      let ret = inPlace ? obj : {}
      for (let field of this.fields) {
        try {
          let val = field.validate(obj, inPlace)
          if (!(inPlace || isUndefined(val))) {
            ret[field.name] = val
          }
        } catch (err) {
          (err.keys || (err.keys = [])).unshift(field.name)
          throw err
        }
      }
      return ret
    } catch (err) {
      if (err.keys) {
        err.path = err.keys.join('.')
      }
      throw err
    }
  }
  get name () {
    return this.opts.name
  }
}
