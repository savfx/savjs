import {SchemaControl} from './SchemaControl.js'
import {isObject, isUndefined} from 'sav-util'

export class SchemaStruct extends SchemaControl {
  create (obj) {
    let isObj = isObject(obj)
    let struct = isObj ? obj : {}
    this.fields.forEach((it) => {
      struct[it.name] = isObj && (it.name in obj) ? it.create(obj[it.name]) : it.create()
    })
    return struct
  }
  fieldByName (name) {
    if (!this.fieldMap) {
      this.fieldMap = this.fields.reduce((ret, it) => {
        ret[it.name] = it
        return ret
      }, {})
    }
    return this.fieldMap[name]
  }
  validate (obj, opts) {
    try {
      let {extract, replace} = opts
      let ret = extract ? {} : obj
      for (let field of this.fields) {
        try {
          let val = field.validate(obj, opts)
          if (!isUndefined(val)) {
            if (extract || replace) {
              ret[field.name] = val
            }
          }
        } catch (err) {
          (err.keys || (err.keys = [])).unshift(field.name)
          throw err
        }
      }
      return ret
    } catch (err) {
      if (err.keys) {
        err.path = err.keys.join('.')
      }
      throw err
    }
  }
}
