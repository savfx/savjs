
class SchemaTypeError extends Error {
  constructor (type, value, message = '数据类型 {type} 无法识别数值 {value}') {
    super(message.replace('{type}', type).replace('{value}', String(value)))
    this.type = type
    this.value = value
  }
}

class SchemaEnumError extends Error {
  constructor (type, value, message = '枚举类型 {type} 无法识别数值 {value}') {
    super(message.replace('{type}', type).replace('{value}', String(value)))
    this.type = type
    this.value = value
  }
}

class SchemaRequiredError extends Error {
  constructor (field, message = '字段{field}不存在') {
    super(message.replace('{field}', field))
    this.field = field
  }
}

export {SchemaTypeError}
export {SchemaEnumError}
export {SchemaRequiredError}
