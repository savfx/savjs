/**
 * 简单类型
 */
import {isFunction, prop} from 'sav-util'
import {SCHEMA_TYPE} from './consts.js'

export class SchemaType {
  constructor (schema, props) {
    this.schemaType = SCHEMA_TYPE
    this.props = props
    if (this.name) {
      schema.export(this)
    }
  }
  get name () {
    let {name} = this.props
    return isFunction(name) ? name.name : name
  }
  parse (val) {
    return this.props.parse(val)
  }
  check (val) {
    return this.props.check(val)
  }
  create (val) {
    if (arguments.length) {
      return this.parse(val)
    }
    let fn = this.props.default || this.props.name
    return fn()
  }
}
