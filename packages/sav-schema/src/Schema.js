import {isArray, isObject, isFunction, isString} from 'sav-util'

import {SchemaType} from './SchemaType.js'
import {SchemaEnum} from './SchemaEnum.js'
import {SchemaList} from './SchemaList.js'
import {SchemaField} from './SchemaField.js'
import {SchemaRefer} from './SchemaRefer.js'
import {SchemaStruct} from './SchemaStruct.js'
import {SchemaCheck} from './SchemaCheck.js'
import {registerTypes} from './types.js'
import {registerChecks} from './checks.js'
import {SchemaNoRuleError} from './SchemaError.js'
import {SCHEMA_TYPE, SCHEMA_ENUM, SCHEMA_STURCT, SCHEMA_LIST, SCHEMA_REFER, SCHEMA_FIELD} from './consts.js'

export class Schema {
  constructor (opts) {
    this.opts = Object.assign({
      strict: true
    }, opts)
    this.idMap = {}
    this.nameMap = {}
    this.checks = {}
    registerTypes(this)
    registerChecks(this)
  }
  declare (data, opts = {}) {
    if (isArray(data)) {
      return data.map(it => this.declare(it, opts))
    } else if (isObject(data)) {
      let ret = createSchema(this, data, opts)
      return ret
    }
  }
  load (data, opts = {}) {
    // 从suite加载
    ['fields', 'enums', 'lists', 'structs', 'schemas'].forEach(it => {
      if (data[it]) {
        this.declare(data[it], opts)
      }
    })
  }
  registerType (opts) {
    let ret = new SchemaType(this, opts)
    ret.schemaType = SCHEMA_TYPE
    exportSchema(this, ret)
    return ret
  }
  registerCheck (opts) {
    let ret = new SchemaCheck(this, opts)
    let {name, alias} = ret
    this.checks[name] = ret
    if (alias) {
      this.checks[alias] = ret
    }
    return ret
  }
  applyChecks (value, rules) {
    if (isArray(rules)) {
      for (let rule of rules) {
        let [name] = rule
        let ruller = this.checks[name]
        if (ruller) {
          if (!ruller.check(value, rule)) {
            return rule
          }
        } else {
          throw new SchemaNoRuleError(name)
        }
      }
    }
  }
  getRef (ret) {
    let {opts} = ret
    switch (ret.schemaType) {
      case SCHEMA_REFER:
        return this.idMap[opts.refer] || this.nameMap[opts.refer]
      case SCHEMA_LIST:
        return this.idMap[opts.list] || this.nameMap[opts.list]
      case SCHEMA_FIELD:
        return this.idMap[opts.type] || this.nameMap[opts.type]
    }
  }
}

function createSchema (schema, data, opts) {
  let {enums, props, refer, list, type, refs} = data
  if (refs) {
    if (isObject(refs)) {
      refs = Object.keys(refs).map(it => {
        refs[it].name = it
        return refs[it]
      })
    }
    schema.declare(refs)
  }
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
  } else if (type) {
    ret = new SchemaField(schema, data)
    ret.schemaType = SCHEMA_FIELD
    if (ret.id) {
      schema.idMap[ret.id] = ret
    }
    return ret
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
