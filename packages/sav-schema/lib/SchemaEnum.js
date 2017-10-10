/**
 * 枚举类型
 */
import {isObject, isArray} from 'sav-util'
import {SCHEMA_ENUM} from './consts.js'

/*
{
  name: 'Sex',
  enums: [
    {key: 'male', value: 1},
    {key: 'female', value: 2}
  ],
  strict: true,
  default: 'male'
}
 */

export class SchemaEnum {
  constructor (schema, props) {
    this.schemaType = SCHEMA_ENUM
    this.enums = []
    this.keyMaps = {}
    this.keys = []
    this.values = []
    this.valueMaps = {}
    this.props = props
    let enums = isObject(props.enums) ? toArray(props.enums)
      : (isArray(props.enums) ? props.enums : [])
    enums.forEach((item) => this.addEnum(item))
    if (this.name) {
      schema.export(this)
    }
  }
  addEnum (item) {
    this.keyMaps[item.key] = item
    this.valueMaps[item.value] = item
    this.keys.push(item.key)
    this.values.push(item.value)
    this.enums.push(item)
  }
  hasKey (key) {
    return this.isStrict ? this.keys.indexOf(key) !== -1 : !!this.keyMaps[key]
  }
  hasValue (value) {
    return this.isStrict ? this.values.indexOf(value) !== -1 : !!this.valueMaps[value]
  }
  value (key) {
    if (this.isStrict) {
      let idx = this.keys.indexOf(key)
      if (idx !== -1) {
        return this.keyMaps[key].value
      }
    } else {
      return this.keyMaps[key].value
    }
  }
  key (value) {
    if (this.isStrict) {
      let idx = this.values.indexOf(value)
      if (idx !== -1) {
        return this.keyMaps[this.keys[idx]].key
      }
    } else {
      return this.valueMaps[value].key
    }
  }
  create (val) {
    if (this.hasValue(val)) {
      return val
    }
    return this.parse(this.default)
  }
  check (val) {
    return this.hasValue(val)
  }
  parse (val) {
    if (this.values.indexOf(val) !== -1) {
      return val
    } else if (this.valueMaps[val]) {
      return this.valueMaps[val].value
    }
  }
  get isStrict () {
    return this.props.strict
  }
  get name () {
    return this.props.name
  }
  get default () {
    return this.props.default
  }
}

function toArray (enums) {
  return Object.keys(enums).map((it) => {
    return isObject(enums[it]) ? enums[it] : {key: it, value: enums[it]}
  })
}
