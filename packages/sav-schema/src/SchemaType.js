/**
 * 简单类型
 */

export class SchemaType {
  constructor (props, schema) {
    this.schema = schema
    Object.assign(this, props)
  }
}
