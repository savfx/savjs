
let errors = {
  type: '{value} 不是合法的 {type} 类型',
  enum: '{value} 不是合法的 {type} 类型',
  require: '字段 {field} 不存在',
  check: '字段 {field} 校验失败, 不符合规则 {rule}',
  rule: '校验规则 {rule} 不存在',
  regexp: '错误的正则表达式 {regexp}'
}

export class SchemaTypeError extends Error {
  constructor (type, value, message = errors.type) {
    super(message.replace('{type}', type).replace('{value}', String(value)))
    this.type = type
    this.value = value
  }
}

export class SchemaEnumError extends Error {
  constructor (type, value, message = errors.enum) {
    super(message.replace('{type}', type).replace('{value}', String(value)))
    this.type = type
    this.value = value
  }
}

export class SchemaRequiredError extends Error {
  constructor (field, message = errors.require) {
    super(message.replace('{field}', field))
    this.field = field
  }
}

export class SchemaCheckedError extends Error {
  constructor (field, rule, message = errors.check) {
    super(message.replace('{field}', field).replace('{rule}', rule))
    this.field = field
    this.rule = rule
  }
}

export class SchemaNoRuleError extends Error {
  constructor (rule, message = errors.rule) {
    super(message.replace('{rule}', rule))
    this.rule = rule
  }
}

export class SchemaInvalidRegexpError extends Error {
  constructor (regexp, message = errors.regexp) {
    super(message.replace('{regexp}', regexp))
    this.regexp = regexp
  }
}

export function setErrors (errs) {
  Object.assign(errors, errs)
}
