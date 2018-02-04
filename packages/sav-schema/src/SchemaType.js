import {SchemaBase} from './SchemaBase.js'
import {isUndefined, isFunction} from 'sav-util'

/*
{
  name: 'String',
  check (val) {},
  parse (val) {},
  default: String,
}
 */
export class SchemaType extends SchemaBase {
  parse (val) {
    return this.opts.parse(val)
  }
  check (val) {
    return this.opts.check(val)
  }
  create (val) {
    if (!isUndefined(val)) {
      return this.parse(val)
    }
    let factory = this.opts.default
    if (isFunction(factory)) {
      return factory()
    }
    return factory
  }
}
