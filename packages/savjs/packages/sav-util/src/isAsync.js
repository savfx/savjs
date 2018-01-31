import {isFunction} from './isFunction.js'

export function isAsync (val) {
  return isFunction(val) && val.constructor.name === 'AsyncFunction'
}
