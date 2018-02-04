import {SchemaBase} from './SchemaBase.js'
import {isUndefined} from 'sav-util'
/* eslint {"eqeqeq": 0} */

/*
{
  name: 'Sex',
  *strict: false,
  enums: [
    {key: 'male', value: 1},
    {key: 'female', value: 2},
  ]
}
 */
export class SchemaEnum extends SchemaBase {
  check (val) {
    let {strict, enums} = this.opts
    let len = enums.length
    while (len) {
      let it = enums[--len]
      if (strict) {
        if (it.value === val || (it.key == val)) {
          return true
        }
      } else {
        if (it.value == val || (it.key == val)) {
          return true
        }
      }
    }
  }
  create (val) {
    if (!isUndefined(val)) {
      return val
    }
    return this.opts.enums[0].value
  }
  parse (val) {
    if (isUndefined(val)) {
      return
    }
    let {enums} = this.opts
    let len = enums.length
    while (len) {
      let it = enums[--len]
      if (it.value == val) {
        return it.value
      }
      if (it.key == val) {
        return it.key
      }
    }
  }
}
