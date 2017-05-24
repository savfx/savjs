
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

class SchemaCheckedError extends Error {
  constructor (field, rule, message = '字段{field}不满足校验规则{rule}') {
    super(message.replace('{field}', field).replace('{rule}', rule))
    this.field = field
    this.rule = rule
  }
}

class SchemaNoRuleError extends Error {
  constructor (rule, message = '校验规则{rule}不存在') {
    super(message.replace('{rule}', rule))
    this.rule = rule
  }
}

class SchemaInvalidRegexpError extends Error {
  constructor (regexp, message = '非法的正则表达式{regexp}') {
    super(message.replace('{regexp}', regexp))
    this.regexp = regexp
  }
}

export {SchemaTypeError}
export {SchemaEnumError}
export {SchemaRequiredError}
export {SchemaCheckedError}
export {SchemaNoRuleError}
export {SchemaInvalidRegexpError}
