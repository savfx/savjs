import {isFunction, isObject, isString} from 'sav-util'

export function updateField (field, {schema, refs}) {
  // override [type, subType, ref, subRef, required, key]
  const { type } = field
  if (isString(type)) {
    if (type.indexOf('<') > 0) { // ["Array<User>", "Array", "User"]
      const mat = type.match(/^(\w+)(?:<(\w+)>)?$/)
      field.type = mat[1]
      field.subType = mat[2]
      field.subRef = refs[field.subType] || schema[field.subType]
    }
    field.ref = refs[field.type] || schema[field.type]
  } else if (isObject(type)) {
    field.type = type.name
    field.ref = type
  }
  field.required = ('required' in field) ? field.required : !field.optional
}

/**
createField('Number|@comment:text|@optional|len,4,10')
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

export function createField (input, {schema}) {
  if (isString(input)) {
    return parseFieldStr(input)
  }
  let ret = Object.create(null)
  if (isFunction(input)) {
    // {userName: String} => {userName: 'String'}
    ret.type = input.name
  } else if (isObject(input)) {
    if (input.schema) {
      // { sex: schema.declare({name: 'Sex', enums: []) } => {sex: {type: SexObject}}
      ret.type = input
    } else {
      Object.assign(ret, input) // 赋值属性
      let inputType = input.type
      if (isFunction(inputType)) {
        //  {userName: {type: String, comment: '用户名'}} =>
        ret.type = inputType.name
      } else if (isString(inputType)) {
        //  {userName: {type: 'String|@comment:用户名'}}
        if (inputType.indexOf('|') !== -1) { // 合并解析后的内容
          Object.assign(ret, parseFieldStr(inputType))
        }
      } else if (isObject(inputType)) {
        if (inputType.schema) {
          // {sex: {type: schema.declare({name: 'Sex', enums: []) }}
          ret.type = inputType
        } else {
          // {sex: {type: {name: 'Sex', enums: []} }
          ret.type = schema.declare(inputType)
        }
      }
    }
  }
  return ret
}

function parseFieldStr (input) {
  if (propCache[input]) {
    return clone(propCache[input])
  }
  let ret = Object.create(null)
  let strs = input.split('|')
  ret.type = strs.shift() // 数据类型放在第一位
  strs.forEach((it) => {
    if (it[0] === '@') { // 提取属性 @comment:text => {comment: 'text'}
      let map = it.substr(1, it.length).split(':')
      let key = map.shift()
      ret[lcword(key)] = map.length ? parseValue(map.shift()) : true // 默认为 true
    } else { // 提取校验字段 checkes len,4,10 => [ "len", 4, 10 ]
      let map = it.split(',')
      let method = map.shift()
      if (method.length) {
        let checkes = ret.checkes || (ret.checkes = [])
        checkes.push([method].concat(map.map(parseValue)))
      }
    }
  })
  return clone(propCache[input] = ret)
}

const propCache = {}

function clone (val) {
  return JSON.parse(JSON.stringify(val))
}

function lcword (s) {
  return s.length ? s.substr(0, 1).toLowerCase() + s.substr(1, s.length) : s
}

function parseValue (val) {
  if (val === 'true' || val === 'on') {
    return true
  } else if (val === 'false' || val === 'off') {
    return false
  }
  let ret
  if (String(ret = parseInt(val)) === val) {
    return ret
  } else if (String(ret = parseFloat(val)) === val) {
    return ret
  }
  return val
}
