import {className} from './className.js'

export function isDate (val) {
  return className(val) === 'Date'
}
