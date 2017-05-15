/**
 * 结构体类型
 */
import {objectAssign} from './util.js'
import {createField, updateField} from './structField.js'
import {isObject, isArray} from 'sav-util'
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
  constructor (opts, schema) {
    this.schema = schema
    this.refs = {}
    this.fields = []
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
    this.fields.push(field)
  }
  addRef (ref, name) {
    if (ref.export && !ref.name) {
      ref.name = name
    }
    this.refs[name] = this.schema.declare(ref)
  }
  create (obj) {
    let struct = {}
    let isObj = isObject(obj)
    this.fields.forEach((it) => {
      let ret = isObj && (it.name in obj) ? it.ref.create(obj[it.name]) : it.ref.create()
      if (isArray(ret) && ret.length && it.type === 'Array' && it.subRef) {
        ret = ret.map((item) => it.subRef.create(item))
      }
      struct[it.name] = ret
    })
    return struct
  }
  check (obj) {
    
  }
}
