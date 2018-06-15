import * as SavUtil from 'sav-util'

const {tmpl, isString} = SavUtil

export function createActionBody (input, opts = {}) {
  return makeActionBody(prepareActionState(input, opts))
}

function prepareActionState (input, opts = {}) {
  let state = Object.assign({
    SavUtil
  }, input)
  return state
}

const makeActionBody = tmpl(`{% const {ucfirst, lcfirst} = state.SavUtil 
%}// {%#state.modalName%}.{%#state.actionName%}
{% if (state.request){ %}
func Prepare{%#state.requestName%}(ds schema.DataSource, ctx *Context)  {
  if ds.IsForm() {
    ctx.{%#state.requestName%} = ParseForm{%#state.requestSchema%}(ds.GetForm{%#state.requestType%}())
  } else {
    ctx.{%#state.requestName%} = Parse{%#state.requestSchema%}(ds.Get{%#state.requestType%}Access())
  }
}{% } %}
{% if (state.response){ %}
func Prepare{%#state.responseName%}(ds schema.DataSource, ctx *Context)  {
  if ds.IsForm() {
    ctx.{%#state.responseName%} = ParseForm{%#state.responseSchema%}(ds.GetForm{%#state.responseType%}())
  } else {
    ctx.{%#state.responseName%} = Parse{%#state.responseSchema%}(ds.Get{%#state.responseType%}Access())
  }
}{% } %}
`)
