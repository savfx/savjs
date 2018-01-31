import {className} from './className.js'

export function isRegExp (val) {
  return className(val) === 'RegExp'
}
