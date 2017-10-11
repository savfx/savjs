import {SchemaNoRuleError} from './SchemaError.js'
import {isObject, isArray} from 'sav-util'

const defaultTypes = []

export function registerType (opts) {
  if (isArray(opts)) {
    defaultTypes.push.apply(defaultTypes, opts)
  } else if (isObject(opts)) {
    defaultTypes.push(opts)
  }
}

export function declareTypes (schema) {
  schema.declare(defaultTypes)
}

const defaultCheckes = {}

export function registerCheck (name, func) {
  if (isObject(name, func)) {
    Object.assign(defaultCheckes, name, func)
  } else {
    defaultCheckes[name] = func
  }
}

export function applyCheckValue (value, rules) {
  if (isArray(rules)) {
    for (let rule of rules) {
      let [name] = rule
      if (!defaultCheckes[name]) {
        throw new SchemaNoRuleError(name)
      }
      if (!defaultCheckes[name](value, rule)) {
        return rule
      }
    }
  }
}
