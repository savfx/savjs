import {isArray, isObject, isFunction} from 'sav-util'

import {SchemaType} from './SchemaType.js'
import {SchemaArray} from './SchemaArray.js'
import {SchemaEnum} from './SchemaEnum.js'
import {SchemaStruct} from './SchemaStruct.js'

export function convertFunctionToName (obj) {
  if (isObject(obj)) {
    for (let name in obj) {
      let value = obj[name]
      if (isFunction(value)) {
        obj[name] = value.name
      } else if (isObject(value) || isArray(value)) {
        convertFunctionToName(value)
      }
    }
  } else if (isArray(obj)) {
    obj.map((value) => {
      if (isFunction(value)) {
        return value.name
      } else if (isObject(value) || isArray(value)) {
        return convertFunctionToName(value)
      }
      return value
    })
  }
  return obj
}

export function convertOpts (opts) {
  return JSON.parse(JSON.stringify(convertFunctionToName(opts)))
}

export function createSchema (schema, opts, root) {
  let ref
  if (opts.enums) {
    ref = new SchemaEnum(schema, opts)
  } else if (opts.props) {
    ref = new SchemaStruct(schema, opts, root)
  } else if (opts.array) {
    ref = new SchemaArray(schema, opts, root)
  }
  return ref
}
