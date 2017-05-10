/**
 * 简单类型
 */
import {isFunction} from 'sav-util'

/*
{
  name: String
}
虽然支持以下形式 但是基本数据类型不建议使用
{
  name: 'String',
  default: String
}
{
  name: 'String',
  default: ''
}
 */

export class SchemaType {
  constructor (props, schema) {
    this.schema = schema
    Object.assign(this, props)
    if (isFunction(this.name)) {
      if (!('default' in this)) {
        this.default = this.name
      }
      this.name = this.name.name
    }
    if (this.name) {
      schema.export(this)
    }
  }
  // parse
  // check
  create (val) {
    if (arguments.length) {
      if (isFunction(val)) {
        return this.parse(val())
      }
      return this.parse(val)
    } else {
      return isFunction(this.default) ? this.default() : this.default
    }
  }
}
