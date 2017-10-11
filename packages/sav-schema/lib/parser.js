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

let maps = {
  props: SchemaStruct,
  enums: SchemaEnum,
  array: SchemaArray
}

let keys = Object.keys(maps)

export function createSchema (schema, opts, root) {
  let ref
  let Factory = keys.filter((key) => opts[key]).shift()
  if (Factory) {
    opts = JSON.parse(JSON.stringify(convertFunctionToName(opts)))
  }
  Factory = maps[Factory] || SchemaType
  ref = new Factory(schema, opts, root)
  return ref
}
