import {isArray, isObject, isFunction, isRegExp} from 'sav-util'

import {SchemaType} from './SchemaType.js'
import {SchemaArray} from './SchemaArray.js'
import {SchemaEnum} from './SchemaEnum.js'
import {SchemaStruct} from './SchemaStruct.js'

export function convertFunctionToName (obj) {
  if (isObject(obj)) {
    for (let name in obj) {
      let value = obj[name]
      if (isRegExp(value)) {
        value = value.toString()
      } else if (isFunction(value)) {
        obj[name] = value.name
      } else if (isObject(value) || isArray(value)) {
        convertFunctionToName(value)
      }
    }
  } else if (isArray(obj)) {
    obj.forEach((value, id) => {
      if (isRegExp(value)) {
        obj[id] = value.toString()
      } else if (isFunction(value)) {
        obj[id] = value.name
      } else if (isObject(value) || isArray(value)) {
        obj[id] = convertFunctionToName(value)
      }
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
    let str = JSON.stringify(convertFunctionToName(opts))
    // console.log(str)
    opts = JSON.parse(str)
  }
  Factory = maps[Factory] || SchemaType
  ref = new Factory(schema, opts, root)
  return ref
}
