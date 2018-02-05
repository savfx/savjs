
export class SchemaCheck {
  constructor (schema, opts) {
    this.opts = opts
    this.schema = schema
  }
  get name () {
    return this.opts.name
  }
  get alias () {
    return this.opts.alias
  }
  check (value, args) {
    return this.opts.check(value, args)
  }
  get argc () {
    return this.opts.argc || 1
  }
}
