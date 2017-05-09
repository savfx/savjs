/**
 * 结构体类型
 */

export class SchemaStruct {
  constructor (props, schema) {
    this.schema = schema
    Object.assign(this, props)
  }
}
