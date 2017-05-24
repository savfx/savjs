/**
 * 结构体类型
 */
import {objectAssign, SCHEMA_STURCT} from './util.js'
import {SchemaField} from './SchemaField.js'
import {createField, updateField} from './structField.js'
import {isObject, isUndefined} from 'sav-util'
/*
props: {
  name: String,
  name1: 'String',
  age: {
    type: Number
  },
  age1: 'Number',
  sex: 'Sex',
  sex1: {
    type: 'Sex',
    optional: true
  }
},
refs: {
  Sex: {
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  }
}
 */

export class SchemaStruct {
  constructor (opts, schema, root) {
    this.schemaType = SCHEMA_STURCT
    this.schema = schema
    this.fields = []
    this.root = root || this
    this.refs = root ? null : {} // 使用root的refs
    objectAssign(this, opts, ['props, refs', 'export'])
    if (this.name) {
      schema.export(this)
    }
    let refs = opts.refs
    for (let ref in refs) {
      this.addRef(refs[ref], ref)
    }
    let props = opts.props
    for (let prop in props) {
      this.addField(props[prop], prop)
    }
  }
  addField (value, name) {
    let field = createField(value, this)
    field.name = name
    updateField(field, this)
    this.fields.push(new SchemaField(field, this))
  }
  addRef (ref, name) {
    if (ref.export && !ref.name) {
      ref.name = name
    }
    this.root.refs[name] = this.schema.declare(ref, this.root)
  }
  create (obj = {}) {
    let struct = {}
    let isObj = isObject(obj)
    this.fields.forEach((it) => {
      struct[it.name] = isObj && (it.name in obj) ? it.create(obj[it.name]) : it.create()
    })
    return struct
  }
  createState (obj) {
    return {[`${this.state}`]: this.create(obj)}
  }
  validate (obj, inPlace) {
    try {
      let ret = inPlace ? obj : {}
      for (let field of this.fields) {
        try {
          let val = field.validate(obj, inPlace)
          if (!isUndefined(val)) {
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
  check (obj) {
    return this.validate(obj, true)
  }
  checkThen (obj) {
    return Promise.resolve().then(() => {
      return this.check(obj)
    })
  }
  extract (obj) {
    return this.validate(obj, false)
  }
  extractThen (obj) {
    return Promise.resolve().then(() => {
      return this.extract(obj)
    })
  }
}
