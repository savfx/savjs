
class SchemaTypeError extends Error {
  constructor(type, value, message = '') {
    super(message)
    this.type = type
    this.value = value
  }
}

export {SchemaTypeError}
