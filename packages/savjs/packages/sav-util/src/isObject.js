import {className} from './className.js'

export function isObject (val) {
  return className(val) === 'Object' && val !== null
}
