import {SchemaInvalidRegexpError} from './SchemaError.js'

// 数字大小
function gt (value, [, arg1]) {
  return value > arg1
}

function gte (value, [, arg1]) {
  return value >= arg1
}

function lt (value, [, arg1]) {
  return value < arg1
}

function lte (value, [, arg1]) {
  return value <= arg1
}

// 包含
function $in (value, argv) {
  return argv.indexOf(value) > 0
}

function nin (value, argv) {
  return argv.indexOf(value) <= 0
}

// 字符串或数组长度
function lgt (value, argv) {
  return gt(value.length, argv)
}

function lgte (value, argv) {
  return gte(value.length, argv)
}

function llt (value, argv) {
  return lt(value.length, argv)
}

function llte (value, argv) {
  return lte(value.length, argv)
}

let regexpMaps = {}
// 正则表达式
function re (value, [, regexp]) {
  if (typeof regexp === 'string') {
    if (!regexpMaps[regexp]) {
      regexpMaps[regexp] = toRegExp(regexp)
    }
  }
  let ref = (regexpMaps[regexp] || regexp)
  return ref.test(value)
}

function nre (value, argv) {
  return !re(value, argv)
}

// https://github.com/borela/str-to-regexp/blob/master/src/index.js
const COMPLEX_BEGIN = /^\s*\//
const COMPLEX_REGEX = /^\s*\/(.+)\/(\w*)\s*$/

function parseWithFlags (fullPattern) {
  try {
    let [, pattern, flags] = fullPattern.match(COMPLEX_REGEX)
    return flags
      ? new RegExp(pattern, flags)
      : new RegExp(pattern)
  } catch (e) {
    throw new SchemaInvalidRegexpError(fullPattern)
  }
}

function toRegExp (pattern) {
  return COMPLEX_BEGIN.test(pattern)
    ? parseWithFlags(pattern)
    : new RegExp(pattern)
}

let checks = [
  {name: 'gt', alias: '>', check: gt},
  {name: 'gte', alias: '>=', check: gte},
  {name: 'lt', alias: '<', check: lt},
  {name: 'lte', alias: '<=', check: lte},
  {name: 'in', check: $in},
  {name: 'nin', check: nin},
  {name: 'lgt', check: lgt},
  {name: 'lgte', check: lgte},
  {name: 'llt', check: llt},
  {name: 'llte', check: llte},
  {name: 're', check: re},
  {name: 'nre', check: nre}
]

export function registerChecks (schema) {
  checks.forEach(it => schema.registerCheck(it))
}
