import * as SavUtil from 'sav-util'
import {getNativeType} from './type'

const {tmpl} = SavUtil

function prepareReferState (input, opts = {}) {
  let state = {
    SavUtil
  }
  state.input = input
  state.referName = input.name
  state.refType = getNativeType(input.refer)
  return state
}

export function createReferBody (input, opts = {}) {
  return makeReferBody(prepareReferState(input, opts))
}

const makeReferBody = tmpl(`{% 
  const {ucfirst, lcfirst} = state.SavUtil
%}
// {%#state.referName%} {%#state.input.title%}
type {%#state.referName%} {%#state.refType%}

`)
