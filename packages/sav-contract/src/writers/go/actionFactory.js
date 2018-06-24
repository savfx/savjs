import * as SavUtil from 'sav-util'

const {tmpl} = SavUtil

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
  let paramsArgs = ''
  let paramsInput = ''
  let makeParams = ''
  let hasParams = state.route.keys && state.route.keys.length > 0
  if (hasParams) {
    paramsArgs = state.route.keys.join(', ') + ' string'
    paramsInput = state.route.keys.join(', ')
    makeParams = "data.Params = map[string]interface{}{\\n" + 
      state.route.keys.map(it => '\\t"' + it + '": ' + it + ',').join('\\n') + 
      "\\n  }\\n"
  }
%}// {%#state.modalName%}.{%#state.actionName%}

type {%#lcfirst(state.modalName)%}{%#state.actionName%}Data struct {
  sav.BaseDataHandler
{% if (state.request){ %}  Input * {%#state.requestSchema%} {% } %}
{% if (state.response){ %}  Output * {%#state.responseSchema%} {% } %}
}

func (ctx {%#lcfirst(state.modalName)%}{%#state.actionName%}Data) GetInputValue () interface{} {
{% if (state.request){ %}
  return ctx.Input
{% }else { %} 
  return nil
{% } %}
}

func (ctx {%#lcfirst(state.modalName)%}{%#state.actionName%}Data) GetOutputValue () interface{} {
{% if (state.response){ %}
  return ctx.Output
{% }else { %} 
  return nil
{% } %}
}

func (ctx {%#lcfirst(state.modalName)%}{%#state.actionName%}Data) SetInputValue (value interface{}) {
{% if (state.request){ %}
  ctx.Input = value.(*{%#state.requestSchema%})
{% } %}
}

func (ctx {%#lcfirst(state.modalName)%}{%#state.actionName%}Data) SetOutputValue (value interface{}) {
{% if (state.response){ %}
  ctx.Output = value.(*{%#state.responseSchema%})
{% } %}
}

func (ctx *{%#lcfirst(state.modalName)%}{%#state.actionName%}Data) ParseInput(ds sav.DataSource)  {
{% if (state.request){ %}
  if ds.IsForm() {
    ctx.Input = ParseForm{%#state.requestSchema%}(ds.GetForm{%#state.requestType%}())
  } else {
    ctx.Input = Parse{%#state.requestSchema%}(ds.Get{%#state.requestType%}Access())
  }
{% } %}
}

func (ctx *{%#lcfirst(state.modalName)%}{%#state.actionName%}Data) ParseOutput(ds sav.DataSource)  {
{% if (state.response){ %}
  if ds.IsForm() {
    ctx.Output = ParseForm{%#state.responseSchema%}(ds.GetForm{%#state.responseType%}())
  } else {
    ctx.Output = Parse{%#state.responseSchema%}(ds.Get{%#state.responseType%}Access())
  }
{% } %}
}

func new{%#state.modalName%}{%#state.actionName%}Data() sav.DataHandler {
  res := &{%#lcfirst(state.modalName)%}{%#state.actionName%}Data{}
  return  res
}

func bind{%#state.modalName%}{%#state.actionName%}Input(handler sav.DataHandler, value interface{}) {
{% if (state.request){ %}
  data := handler.(*{%#lcfirst(state.modalName)%}{%#state.actionName%}Data)
  data.Input = value.(*{%#state.requestSchema%})
{% } %}
}

func bind{%#state.modalName%}{%#state.actionName%}Output(handler sav.DataHandler, value interface{}) {
{% if (state.response){ %}
  data := handler.(*{%#lcfirst(state.modalName)%}{%#state.actionName%}Data)
  data.Output= value.(*{%#state.responseSchema%})
{% } %}
}

func new{%#state.modalName%}{%#state.actionName%}ActionHandler() sav.ActionHandler {
  return sav.ActionHandler{
    Create: new{%#state.modalName%}{%#state.actionName%}Data,
    BindInput: bind{%#state.modalName%}{%#state.actionName%}Input,
    BindOutput: bind{%#state.modalName%}{%#state.actionName%}Output,
  }
}

{% if (state.request && state.response){ %}

func (ctx Contract) {%#state.modalName%}{%#state.actionName%} ({%#(paramsArgs ? (paramsArgs + ', ') : paramsArgs)%}inputData {%#state.requestSchema%}) {%#state.responseSchema%} {
  res, _, err := ctx.Fetch{%#state.modalName%}{%#state.actionName%}({%#(paramsInput ? (paramsInput + ', ') : paramsInput)%}inputData)
  if err != nil {
    panic(err)
  }
  if res == nil {
    panic(errors.New("invalidate response of {%#state.modalName%}{%#state.actionName%}"))
  }
  return *res
}

func (ctx Contract) Fetch{%#state.modalName%}{%#state.actionName%}({%#(paramsArgs ? (paramsArgs + ', ') : paramsArgs)%}inputData {%#state.requestSchema%}) (* {%#state.responseSchema%}, sav.Response, error) {
  data := &{%#lcfirst(state.modalName)%}{%#state.actionName%}Data{Input:&inputData}
  {%#makeParams%}
  response, err := ctx.Fetch("{%#state.modalName%}", "{%#state.actionName%}", data)
  return data.Output, response, err
}

{% } else if (state.request) { %}

func (ctx Contract) {%#state.modalName%}{%#state.actionName%} ({%#(paramsArgs ? (paramsArgs + ', ') : paramsArgs)%}inputData {%#state.requestSchema%}) {
  _, err := ctx.Fetch{%#state.modalName%}{%#state.actionName%}({%#(paramsInput ? (paramsInput + ', ') : paramsInput)%}inputData)
  if err != nil {
    panic(err)
  }
  return
}

func (ctx Contract) Fetch{%#state.modalName%}{%#state.actionName%}({%#(paramsArgs ? (paramsArgs + ', ') : paramsArgs)%}inputData {%#state.requestSchema%}) (sav.Response, error) {
  data := &{%#lcfirst(state.modalName)%}{%#state.actionName%}Data{Input:&inputData}
  {%#makeParams%}
  response, err := ctx.Fetch("{%#state.modalName%}", "{%#state.actionName%}", data)
  return response, err
}

{% } else if (state.response) { %}

func (ctx Contract) {%#state.modalName%}{%#state.actionName%} ({%#paramsArgs%}) {%#state.responseSchema%} {
  res, _, err := ctx.Fetch{%#state.modalName%}{%#state.actionName%}({%#paramsInput%})
  if err != nil {
    panic(err)
  }
  if res == nil {
    panic(errors.New("invalidate response of {%#state.modalName%}{%#state.actionName%}"))
  }
  return *res
}

func (ctx Contract) Fetch{%#state.modalName%}{%#state.actionName%}({%#paramsArgs%}) (* {%#state.responseSchema%}, sav.Response, error) {
  data := &{%#lcfirst(state.modalName)%}{%#state.actionName%}Data{}
  {%#makeParams%}
  response, err := ctx.Fetch("{%#state.modalName%}", "{%#state.actionName%}", data)
  return data.Output, response, err
}

{% } else { %}

func (ctx Contract) {%#state.modalName%}{%#state.actionName%} ({%#paramsArgs%}) {
  _, err := ctx.Fetch{%#state.modalName%}{%#state.actionName%}({%#paramsInput%})
  if err != nil {
    panic(err)
  }
}

func (ctx Contract) Fetch{%#state.modalName%}{%#state.actionName%}({%#paramsArgs%}) (sav.Response, error) {
  data := &{%#lcfirst(state.modalName)%}{%#state.actionName%}Data{}
  {%#makeParams%}
  response, err := ctx.Fetch("{%#state.modalName%}", "{%#state.actionName%}", data)
  return response, err
}

{% } %}

`)

export function createContractBody (input, opts = {}) {
  return makeContractBody(prepareContractState(input, opts))
}

function prepareContractState (input, opts = {}) {
  let state = Object.assign({
    SavUtil
  }, input)
  return state
}

const makeContractBody = tmpl(`
type Contract struct {
  sav.BaseContract
}

func NewContract(app sav.Application, options map[string]interface{}) *Contract {
  res := &Contract{}
  res.Init(app, "{%#state.name%}", options)
  res.SetJsonRoutes(routes)
  {% for (let name in state.modals) { let actions = state.modals[name] %}
  res.DefineModal("{%#name%}",map[string]sav.ActionHandler{
      {% actions.forEach(it => { %}"{%#it.actionName%}": new{%#it.name%}ActionHandler(), {% }) %}
    },
  )
  {% } %}
  app.SyncContract(res)
  return res
}

`)
