/**
 * 枚举类型
 */
import {isObject, isArray} from 'sav-util'

/*
{
  enums: [
    {key: 'male', value: 1},
    {key: 'female', value: 2}
  ]
}
 */

export class SchemaEnum {
  constructor (props, parent) {
    this.parent = parent
    this.keys = {}
    this.values = {}
    Object.assign(this, props)
    let enums = isObject(this.enums) ? toArray (this.enums) : 
      (isArray(this.enums) ? this.enums : [])
    this.enums = []
    enums.forEach((item) => this.addEnum(item))
    if (this.name) {
      parent.exprot(this)
    }
  }
  addEnum (item) {
    this.keys[item.key] = this.values[item.value] = it
    this.enums.push(item)
  }
  hasKey (key) {
    return key in this.keys
  }
  hasValue (value) {
    return value in this.values
  }
  valueOfKey (key) {
    return this.keys[key].value
  }
  keyOfValue (value) {
    return this.values[value].key
  }
}

function toArray (enums) {
  return Object.keys(enums).map((it) => {
    return isObject(enums[it]) ? enums[it] : {key: it, value: enums[it]}
  })
}
