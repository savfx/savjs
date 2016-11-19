import {
    isBoolean,
    isFunction,
    isObject,
    isArray
} from './type'

export function extend () {
    // form jQuery & remove this
  let options, name, src, copy, copyIsArray, clone
  let target = arguments[0] || {}
  let i = 1
  let length = arguments.length
  let deep = false
  if (isBoolean(target)) {
    deep = target
    target = arguments[i] || {}
    i++
  }
  if (typeof target !== 'object' && !isFunction(target)) {
    target = {}
  }
  for (; i < length; i++) {
    options = arguments[i]
        /* jshint eqnull:true */
    if (options != null) {
      for (name in options) {
        src = target[name]
        copy = options[name]
        if (target !== copy) {
          if (deep && copy && (isObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false
              clone = src && isArray(src) ? src : []
            } else {
              clone = src && isObject(src) ? src : {}
            }
            target[name] = extend(deep, clone, copy)
          } else {
            target[name] = copy
          }
        }
      }
    }
  }
  return target
}
