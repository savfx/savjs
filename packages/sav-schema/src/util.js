import {isObject, isArray} from 'sav-util'

export const SCHEMA_TYPE = 1
export const SCHEMA_ENUM = 2
export const SCHEMA_STURCT = 3

export function objectAssign (target, obj, excludes) {
  if (isObject(obj)) {
    let isExclude = isArray(excludes)
    for (let key in obj) {
      if ((!isExclude) || (excludes.indexOf(key) === -1)) {
        target[key] = obj[key]
      }
    }
  }
}
