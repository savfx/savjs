import {isArray, isObject, isFunction, isString} from 'sav-util'

import {SchemaType} from './SchemaType.js'
import {SchemaEnum} from './SchemaEnum.js'
import {SchemaList} from './SchemaList.js'
import {SchemaField} from './SchemaField.js'
import {SchemaRefer} from './SchemaRefer.js'
import {SchemaStruct} from './SchemaStruct.js'
import {registerTypes} from './types.js'

const SCHEMA_TYPE = 1
const SCHEMA_ENUM = 2
const SCHEMA_STURCT = 3
const SCHEMA_LIST = 4
const SCHEMA_REFER = 5
const SCHEMA_FIELD = 6

export class Schema {
  constructor (opts) {
    this.opts = Object.assign({
      strict: true
    }, opts)
    this.idMap = {}
    this.nameMap = {}
    registerTypes(this)
  }
  declare (data, opts = {}) {
    if (isArray(data)) {
      return data.map(it => this.declare(it, opts))
    } else if (isObject(data)) {
      let ret = createSchema(this, data, opts)
      return ret
    }
  }
  registerType (opts) {
    let ret = new SchemaType(this, opts)
    ret.schemaType = SCHEMA_TYPE
    exportSchema(this, ret)
    return ret
  }
  getRef (ret) {
    let {opts} = ret
    switch (ret.schemaType) {
      case SCHEMA_REFER:
        return this.idMap[opts.refId] || this.nameMap[opts.refer]
      case SCHEMA_LIST:
        return this.idMap[opts.refId] || this.nameMap[opts.list]
      case SCHEMA_FIELD:
        return this.idMap[opts.refId] || this.nameMap[opts.type]
    }
  }
}

function createSchema (schema, data, opts) {
  let {enums, props, refer, list} = data
  let ret
  if (props) {
    if (isObject(props)) {
      props = Object.keys(props).map(it => {
        let val = props[it]
        if (!isObject(val)) {
          val = {type: val}
        }
        if (isFunction(val.type)) {
          val.type = val.type.name
        }
        val.name = it
        return val
      })
    }
    let fields = props.map(it => {
      if (isString(it)) {
        return schema.idMap[it]
      }
      if (isFunction(it.type)) {
        it.type = it.type.name
      }
      let field = new SchemaField(schema, it)
      field.schemaType = SCHEMA_FIELD
      return field
    })
    ret = new SchemaStruct(schema, data)
    ret.schemaType = SCHEMA_STURCT
    ret.fields = fields
  } else if (refer) {
    ret = new SchemaRefer(schema, data)
    ret.schemaType = SCHEMA_REFER
  } else if (list) {
    if (isFunction(data.list)) {
      data.list = data.list.name
    }
    ret = new SchemaList(schema, data)
    ret.schemaType = SCHEMA_LIST
  } else if (enums) {
    ret = new SchemaEnum(schema, data)
    ret.schemaType = SCHEMA_ENUM
  }
  exportSchema(schema, ret)
  return ret
}

function exportSchema (schema, ref) {
  if (ref.id) {
    schema.idMap[ref.id] = ref
  }
  if (ref.name) {
    schema[ref.name] = schema.nameMap[ref.name] = ref
  }
}
