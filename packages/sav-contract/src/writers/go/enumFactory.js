import * as SavUtil from 'sav-util'

const {tmpl, isString} = SavUtil

function prepareEnumState (input, opts = {}) {
  let state = {
    SavUtil
  }
  state.input = input
  state.enums = input.enums
  state.enumName = input.name
  state.keyType = opts.keyType || 'string'
  state.valueType = opts.valueType || 'int'
  if (input.enums.length) {
	  let key = input.enums[0].key
	  let val = input.enums[0].val
	  state.keyType = isString(key) ? 'string' : (opts.defaultIntType || 'int')
	  state.valType = isString(val) ? 'string' : (opts.defaultIntType || 'int')
  }
  let keyIsString = state.keyType == 'string'
  let valIsString = state.valType == 'string'
  let keyText = []
  let valueText = []
  input.enums.forEach(it => {
    keyText.push(keyIsString ? `"${it.key}"` : it.key)
    valueText.push(valIsString ? `"${it.value}"` : it.value)
  })
  state.keyText = keyText.join(', ')
  state.valueText = valueText.join(', ')
  return state
}

export function createEnumBody (input, opts = {}) {
  return makeEnumBody(prepareEnumState(input, opts))
}

const makeEnumBody = tmpl(`{% 
  const {ucfirst, lcfirst} = state.SavUtil
%}
// {%#state.enumName%} {%#state.input.title%} 
{% state.enums.forEach((it) => { %}// {%#it.key%} {%#it.value%} {%#it.title||''%}
{% }) %}type {%#state.enumName%} {%#state.valueType%}

var {%#state.enumName%}Value = &struct {
{% state.enums.forEach((it) => { %}\t{%#ucfirst(it.key)%} {%#state.enumName%}
{% }) %}}{{%#state.valueText%}}

var {%#state.enumName%}Name = &struct {
{% state.enums.forEach((it) => { %}\t{%#ucfirst(it.key)%} {%#state.keyType%}
{% }) %}}{{%#state.keyText%}}

var {%#lcfirst(state.enumName)%}ValueMap = map[{%#state.keyType%}]{%#state.enumName%} {
{% state.enums.forEach((it) => { %}\t{%#state.enumName%}Name.{%#ucfirst(it.key)%}: {%#state.enumName%}Value.{%#ucfirst(it.key)%},
{% }) %}}

var {%#lcfirst(state.enumName)%}KeyMap = map[{%#state.enumName%}]{%#state.keyType%} {
{% state.enums.forEach((it) => { %}\t{%#state.enumName%}Value.{%#ucfirst(it.key)%}: {%#state.enumName%}Name.{%#ucfirst(it.key)%},
{% }) %}}

func Parse{%#state.enumName%}(val *convert.ValueAccess) *{%#state.enumName%} {
  if val != nil {
    ptr := val.{%#ucfirst(state.valType)%}Ptr()
    if ptr != nil {
      sval := ({%#state.enumName%})(*ptr)
      if _, ok := {%#lcfirst(state.enumName)%}KeyMap[sval]; ok {
        return &sval
      }
    }
    sptr := val.{%#ucfirst(state.keyType)%}Ptr()
    if sptr != nil {
      sval := {%#state.keyType%}(*sptr)
      if v, ok := {%#lcfirst(state.enumName)%}ValueMap[sval]; ok {
        return &v
      }
    }
  }
  return nil
}

var ParseForm{%#state.enumName%} = Parse{%#state.enumName%}
`)
