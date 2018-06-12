import * as SavUtil from 'sav-util'
import {getNativeType} from './type'

const {tmpl, isArray, isString, isObject} = SavUtil

function prepareStructState (input, opts = {}) {
  let state = {
    SavUtil
  }
  state.input = input
  state.structName = input.name
  state.fields = parseFields(input)
  state.ctx = opts.ctx
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
{% state.fields.forEach((it) => { %}\t{%#ucfirst(it.name)%} * {%#it.refType%} // {%#(it.title || '') %}
{% }) %}}
{% state.fields.forEach((it) => {let uname = ucfirst(it.name) %}
func (self {%#state.structName%}) Get{%#uname%}()(res {%#it.refType%}){
\tif self.{%#uname%} != nil {
\t\tres = *self.{%#uname%}
\t}
\treturn
}

func (self * {%#state.structName%}) Set{%#uname%}(val {%#it.refType%}){
\tself.{%#uname%} = &val
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

`)
