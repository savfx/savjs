/*
  将JSON数据转换为Schema
  - 直接将json转换为Schema
  - json+指定部分结构数据类型转换为Schema
 */
import {isObject, isString, isArray, isNumber, isBoolean, isNull, isUndefined} from 'sav-util'

export function toSchema (json) {
  if (isObject(json) || isArray(json)) {
    let ret = {}
    makeSchemaDeepth(ret, json, 'type')
    return ret
  }
}

function makeSchemaDeepth (self, value, typeKey) {
  if (isObject(value)) {
    self.props || (self.props = {})
    for (let field in value) {
      let val = value[field]
      let propVal = {}
      makeSchemaDeepth(propVal, val, 'type')
      self.props[field] = propVal
    }
  } else if (isArray(value)) {
    let first = value[0]
    if (isUndefined(first)) {
      first = null
    }
    if (isObject(first) || isArray(first)) {
      let ref = {}
      makeSchemaDeepth(ref, first, 'array')
      self.array = ref
    } else {
      makeSchemaDeepth(self, first, 'array')
    }
  } else if (isString(value)) {
    self[typeKey] = 'String'
  } else if (isNumber(value)) {
    self[typeKey] = 'Number'
  } else if (isBoolean(value)) {
    self[typeKey] = 'Boolean'
  } else if (isNull(value)) {
    self[typeKey] = 'String'
    self.nullable = true
  } else { // skip ...

  }
}
