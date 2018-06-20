import * as SavUtil from 'sav-util'
import {getNativeType, isNumberType} from './type'

const {tmpl, isArray, isString, isObject} = SavUtil

function prepareStructState (input, opts = {}) {
  let state = {
    SavUtil
  }
  state.input = input
  state.structName = input.name
  state.fields = parseFields(input)
  state.ctx = opts.ctx
  state.isNumberType = isNumberType
  return state
}

export function createStructBody (input, opts = {}) {
  return makeStructBody(prepareStructState(input, opts))
}

function parseFields (input) {
  let ret = []
  if (isArray(input.props)) {
    input.props.forEach(field => {
      field.refType = getNativeType(field.type)
      ret.push(field)
    })
  } else if (isObject(input.props)) {
    for (let name in input.props) {
      let field = input.props[name]
      if (isString(field)) {
        field = {
          type: field,
          name: name
        }
      } else if (isObject(field)) {
        field.name || (field.name = name)
      }
      field.refType = getNativeType(field.type)
      ret.push(field)
    }
  }
  return ret
}

const makeStructBody = tmpl(`{% const {ucfirst, lcfirst} = state.SavUtil%}// {%#state.structName%} {%#state.input.title%} 
type {%#state.structName%} struct {
{% state.fields.forEach((it) => { %}\t{%#ucfirst(it.name)%} * {%#it.refType%} \`json:"{%#(it.name)%},omitempty"\` // {%#(it.title || '') %}
{% }) %}}
{% state.fields.forEach((it) => {let uname = ucfirst(it.name) %}
func (ctx {%#state.structName%}) Get{%#uname%}()(res {%#it.refType%}){
\tif ctx.{%#uname%} != nil {
\t\tres = *ctx.{%#uname%}
\t}
\treturn
}

func (ctx * {%#state.structName%}) Set{%#uname%}(val {%#it.refType%}){
\tctx.{%#uname%} = &val
}
{% }) %}

func Parse{%#state.structName%} (object * convert.ObjectAccess) * {%#state.structName%} {
\tif object == nil {
\t\treturn nil
\t}
\tres := &{%#state.structName%}{}
{% state.fields.forEach((it) => { let uname = ucfirst(it.name); if (state.ctx.isStruct(it.refType)){ %}\tres.{%#uname%} = Parse{%#it.refType%}(object.GetObject("{%#it.name%}"))
{% } else if (state.ctx.isEnum(it.refType)){ %}\tres.{%#uname%} = Parse{%#it.refType%}(object.GetValue("{%#it.name%}"))
{% } else if (state.ctx.isList(it.refType)){ %}\tres.{%#uname%} = Parse{%#it.refType%}(object.GetArray("{%#it.name%}"))
{% } else { %}\tres.{%#uname%} = object.Get{%#ucfirst(it.refType)%}Ptr("{%#it.name%}")
{% } }) %}\treturn res
}

func ParseForm{%#state.structName%} (object * convert.FormObject) * {%#state.structName%} {
\tif object == nil {
\t\treturn nil
\t}
\tres := &{%#state.structName%}{}
{% state.fields.forEach((it) => { let uname = ucfirst(it.name); if (state.ctx.isStruct(it.refType)){ %}\tres.{%#uname%} = ParseForm{%#it.refType%}(object.GetObject("{%#it.name%}"))
{% } else if (state.ctx.isEnum(it.refType)){ %}\tres.{%#uname%} = ParseForm{%#it.refType%}(object.GetValue("{%#it.name%}"))
{% } else if (state.ctx.isList(it.refType)){ %}\tres.{%#uname%} = ParseForm{%#it.refType%}(object.GetArray("{%#it.name%}"))
{% } else { %}\tres.{%#uname%} = object.Get{%#ucfirst(it.refType)%}Ptr("{%#it.name%}")
{% } }) %}\treturn res
}

func (ctx {%#state.structName%}) Check(t * checker.Checker) error {
\treturn t.Exec(func () {
{%
  state.fields.forEach((it) => { 
  let uname = ucfirst(it.name)
  let allowNull = it.optional || it.nullable // 1. 可选, 为null, 为空判断
  // console.log(it.refType)
  let isNative = state.ctx.isNative(it.refType)
  let uType = ucfirst(it.refType)
%}\t\t{% if (allowNull) { %}if ctx.{%#uname%} != nil {% } %}{
\t\t\tt.Field("{%#it.name%}", "{%#it.message || ''%}").
{% if (!allowNull) { %}\t\t\tNotNull(ctx.{%#uname%}).{% } %}
{% if (isNative) {
  if (it.checks) {
    it.checks.forEach(({value, name, title}) => {     
      if (['gt', 'lt', 'gte', 'lte'].indexOf(name) !== -1) {// 大小比较
        if (state.isNumberType(it.refType)) {
%}\t\t\t{%=uType%}Ptr{%=ucfirst(name)%}(ctx.{%#uname%}, {%#value%}).
{%
        }
      } else if (['lgt', 'llt', 'lgte', 'llte'].indexOf(name) !== -1) {// 长度比较
%}\t\t\t{%=ucfirst(name)%}(len(*ctx.{%#uname%}), {%#value%}).
{%
      }
    })
  }
%}{% } else { %}\t\t\tCheck(ctx.{%#uname%}).
{% } %}\t\t\tPop()
\t\t}
{% }) %}
\t})
}
`)
