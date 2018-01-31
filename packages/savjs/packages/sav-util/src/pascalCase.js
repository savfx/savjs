import {camelCase} from './camelCase.js'
import {ucfirst} from './ucfirst.js'

export function pascalCase (str) {
  return ucfirst(camelCase(str))
}
