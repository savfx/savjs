import { isObject, isArray, prop, isNull, clone, isString, isFunction } from 'sav-util'
import * as assert from 'sav-assert'

const TYPE_TYPE = 0
const TYPE_ENUM = 1
const TYPE_STRUCT = 2
const defaultTypes = []

export class Schema {
  constructor () {
    this.declare(defaultTypes)
  }
  declare (opts) {
    if (isArray(opts)) {
      return opts.map(it => this.declare(it))
    }
    assert.isObject(opts)
    let ret = createSchemaType(this, opts)
    if (opts.name) {
      this[opts.name] = ret
    }
    return ret
  }
  static register (opts) {
    if (isArray(opts)) {
      defaultTypes.push(...opts)
    } else {
      defaultTypes.push(opts)
    }
  }
}

function createType (schema, opts) {
  const {create, check} = opts
  assert.isFunction(create)
  let ret = {}
  prop(ret, 'check', check)
  prop(ret, 'create', create || (() => opts.default))
  return ret
}

function createEnum (schema, opts) {
  const {enums, create, check} = opts
  let keyMaps = {}
  let values = []
  let keys = []
  let ret = {}
  if (isObject(enums)) {
    for (let key in enums) {
      let it = enums[key]
      if (isObject(it)) {
        assert.inObject(it, 'value')
        values.push((keyMaps[key] = it).value)
      } else {
        values.push((keyMaps[key] = {key: key, value: it}).value)
      }
      keys.push(key)
    }
  } else if (isArray(enums)) {
    enums.forEach((it) => {
      assert.inObject(it, 'key')
      assert.inObject(it, 'value')
      keys.push(it.key)
      values.push((keyMaps[it.key] = it).value)
    })
  }
  prop(ret, 'fieldByKey', val => keyMaps[val])
  prop(ret, 'fieldByValue', val => {
    let idx = values.indexOf(val)
    if (idx !== -1) {
      return keyMaps[keys[idx]]
    }
  })
  prop(ret, 'fields', keyMaps)
  prop(ret, 'keys', keys)
  prop(ret, 'values', values)
  prop(ret, 'check', check || ((val) => assert.inArray(values, val)))
  prop(ret, 'create', create || (() => opts.default))
  return ret
}

function createSturct (schema, opts) {
  const {props, refs, create, check, extract} = opts
  assert.isObject(props)

  let childs = {}
  if (refs) {
    for (let key in refs) {
      let val = refs[key]
      if (val.schema) {
        childs[key] = val
      } else {
        childs[key] = schema.declare(val)
      }
    }
  }

  let fields = []
  for (let key in props) {
    let pval = props[key]
    let field
    if (isString(pval)) {
      field = parseProp(pval)
    } else if (isObject(pval)) {
      if (pval.schema) {
        field = {type: pval}
      } else {
        field = clone(pval)
      }
      if (isObject(pval.type) && pval.type.schema) {
        field.type = pval.type
      }
    } else if (isFunction(pval) && pval.name) { // raw String Boolean type etc.
      field = {type: schema[pval.name]}
    }
    // override [type, subType, ref, subRef, required, key]
    const { type } = field
    if (isString(type)) {
      if (type.indexOf('<') > 0) { // ["Array<User>", "Array", "User"]
        const mat = type.match(/^(\w+)(?:<(\w+)>)?$/)
        field.type = mat[1]
        field.subType = mat[2]
        field.subRef = childs[field.subType] || schema[field.subType]
      } else {
        field.type = type
      }
      field.ref = childs[field.type] || schema[field.type]
    } else if (isObject(type)) {
      field.type = type.name
      field.ref = type
    }
    field.required = ('required' in field) ? field.required : !field.optional
    field.key = key
    fields.push(field)
  }

  let ret = {}
  prop(ret, 'create', create || (() => {
    let struct = {}
    fields.forEach((it) => {
      struct[it.key] = it.ref.create()
    })
    return struct
  }))
  prop(ret, 'check', check || ((value) => {
    try {
      fields.forEach((it) => {
        try {
          checkStructField(ret, value, it)
        } catch (err) {
          (err.keys || (err.keys = [])).unshift(it.key)
          throw err
        }
      })
    } catch (err) {
      if (err.keys) {
        err.path = err.keys.join('.')
      }
      throw err
    }
  }))
  prop(ret, 'extract', extract || ((value) => {
    let res = {}
    try {
      fields.forEach((it) => {
        try {
          res[it.key] = extractStructField(ret, value, it)
        } catch (err) {
          (err.keys || (err.keys = [])).unshift(it.key)
          throw err
        }
      })
    } catch (err) {
      if (err.keys) {
        err.path = err.keys.join('.')
      }
      throw err
    }
    return res
  }))
  prop(ret, 'extractThen', (val) => new Promise((resolve, reject) => {
    let res
    try {
      res = ret.extract(val)
    } catch (err) {
      return reject(err)
    }
    resolve(res)
  }))
  return ret
}

/**
parseField('Number|@comment:text|@optional|len,4,10')
=>
{
    "type": "Number",
    "optional": true,
    "checkes": [
        [ "len", "4", "10" ]
    ],
    "comment": "text"
}
 */

const propCache = {}

function parseProp (str) {
  if (propCache[str]) {
    return clone(propCache[str])
  }
  assert.isString(str)
  let strs = str.split('|')
  let ret = {}
  ret.type = strs.shift() // type first
  ret.checkes = []
  strs = strs.filter(function (it) {
    if (it.length) {
      if (it[0] === '@') {
        let map = it.substr(1, it.length).split(':')
        let key = map.shift()
        ret[lcword(key)] = map.length ? parseValue(map.shift()) : true
        return false
      }
      return true
    }
  }).forEach(function (it) {
    let map = it.split(':')
    if (map.length === 1) {
      ret.checkes.push(it.split(',')) // 或者直接使用这种模式
      // ret.checkes.push([map.shift()])
    } else if (map.length === 2) {
      let key = map.shift()
      let val = map.shift().split(',')
      val.unshift(key)
      ret.checkes.push(val)
    }
  })
  return clone(propCache[str] = ret)
}

function lcword (s) {
  return s.length ? s.substr(0, 1).toLowerCase() + s.substr(1, s.length) : s
}

function parseValue (val) {
  if (val === 'true') {
    return true
  } else if (val === 'false') {
    return true
  }
  let ret
  if ((ret = parseInt(val)) === val) {
    return ret
  } else if ((ret = parseFloat(val)) === val) {
    return ret
  }
  return val
}

function checkStructField (struct, obj, {key, type, subType, required, nullable, ref, checkes, subRef}) {
  if (!required && !(key in obj)) {
    return
  }
  if (nullable && isNull(obj[key])) {
    return
  }
  assert.inObject(obj, key)
  const val = obj[key]
  ref.check(val)
  if (subType) {
    assert.equal(type, 'Array') // allow Array<Struct> only
    for (let i = 0, l = val.length; i < l; ++i) {
      try {
        subRef.check(val[i])
      } catch (err) {
        (err.keys || (err.keys = [])).unshift(i)
        throw err
      }
    }
  }
}

function extractStructField (struct, obj, field) {
  checkStructField(struct, obj, field)
  const val = obj[field.key]
  if (field.subType) {
    let ret = []
    for (let i = 0, l = val.length; i < l; ++i) {
      try {
        field.subRef.check(val[i])
        if (field.subRef.extract) {
          ret.push(field.subRef.extract(val[i]))
        } else {
          ret.push(val[i])
        }
      } catch (err) {
        (err.keys || (err.keys = [])).unshift(i)
        throw err
      }
    }
    return ret
  }
  return val
}

function createSchemaType (schema, opts) {
  let dataType = TYPE_TYPE
  let ret
  if (opts.enums) {
    dataType = TYPE_ENUM
    ret = createEnum(schema, opts)
  } else if (opts.props) {
    dataType = TYPE_STRUCT
    ret = createSturct(schema, opts)
  } else {
    ret = createType(schema, opts)
  }
  prop(ret, 'dataType', dataType)
  prop(ret, 'schema', schema)
  prop(ret, 'checkThen', (val) => new Promise((resolve, reject) => {
    try {
      ret.check(val)
    } catch (err) {
      return reject(err)
    }
    resolve()
  }))
  return ret
}

Schema.register([
  { name: 'String', create: String, check: assert.isString },
  { name: 'Number', create: Number, check: assert.isNumber },
  { name: 'Array', create: Array, check: assert.isArray },
  { name: 'Object', create: Object, check: assert.isObject },
  { name: 'Boolean', create: Boolean, check: assert.isBoolean },
  { name: 'Int', create: Number, check: assert.isInt },
  { name: 'Uint', create: Number, check: assert.isUint }
])
