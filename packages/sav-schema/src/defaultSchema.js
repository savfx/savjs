import {isNumber, isBoolean, isObject, isArray, isString, isInt, isUint} from 'sav-util'

export function stringVal (val) {
  if (isNumber(val) || isBoolean(val)) {
    return String(val)
  }
  return val
}

export function boolVal (val) {
  if (isNumber(val)) {
    return Boolean(val)
  }
  if (isString(val)) {
    if (val === 'true' || val === 'on') {
      return true
    }
    return false
  }
  return val
}

export function numberVal (val) {
  if (isBoolean(val)) {
    return Number(val)
  } else if (isString(val)) {
    if (val === 'true' || val === 'on') {
      return Number(true)
    } else if (val === 'false' || val === 'off') {
      return Number(false)
    } else {
      return Number(val)
    }
  }
  return val
}

export function arrayVal (val) {
  if (isString(val)) {
    if (val[0] === '[') {
      return JSON.parse(val)
    } else if (val.indexOf(',') !== -1) {
      return val.split(',')
    }
  }
  return val
}

export function objectVal (val) {
  if (isString(val)) {
    if (val[0] === '{') {
      return JSON.parse(val)
    }
  }
  return val
}

export default [
  {name: String, check: isString, parse: stringVal},
  {name: Number, check: isNumber, parse: numberVal},
  {name: Boolean, check: isBoolean, parse: boolVal},
  {name: Array, check: isArray, parse: arrayVal},
  {name: Object, check: isObject, parse: objectVal},
  {name: 'Int', default: Number, check: isInt, parse: numberVal},
  {name: 'Uint', default: Number, check: isUint, parse: numberVal}
]
