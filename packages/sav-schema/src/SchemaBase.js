
export class SchemaBase {
  constructor (schema, opts) {
    this.opts = opts
    this.schema = schema
  }
  get id () {
    return this.opts.id
  }
  get name () {
    return this.opts.name
  }
  get ref () {
    return this.schema.getRef(this)
  }
}
