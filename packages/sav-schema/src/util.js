import {isObject, isArray} from 'sav-util'

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
