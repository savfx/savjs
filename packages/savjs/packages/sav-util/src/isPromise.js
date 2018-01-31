import {isFunction} from './isFunction.js'

export function isPromise (val) {
  return val && (typeof val === 'object') && isFunction(val.then)
}
