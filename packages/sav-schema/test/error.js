import test from 'ava'
import {expect} from 'chai'

import {SchemaTypeError,
  SchemaRequiredError,
  SchemaCheckedError,
  SchemaNoRuleError,
  setErrors,
  getErrors
} from '../lib/SchemaError.js'

function getError (err, {msg} = {}) {
  if (msg) {
    return err.message
  }
  return err
}

let originErrors = getErrors()

function restoreErrors () {
  setErrors(originErrors)
}

test('SchemaError.api', ava => {
  restoreErrors()
  {
    let err = new SchemaTypeError('String', 1)
    expect(getError(err)).to.be.a('error')
    expect(getError(err, {msg: true})).to.eql('Value [1] is not of [String] type')
  }
  {
    let err = new SchemaRequiredError('sex')
    expect(getError(err)).to.be.a('error')
    expect(getError(err, {msg: true})).to.eql('Field [sex] not found')
  }
  {
    let err = new SchemaCheckedError('sex', 'gt')
    expect(getError(err)).to.be.a('error')
    expect(getError(err, {msg: true})).to.eql('Field [sex] can not matched [gt] rule')
  }
  {
    let err = new SchemaNoRuleError('sex')
    expect(getError(err)).to.be.a('error')
    expect(getError(err, {msg: true})).to.eql('Rule [sex] not found')
  }
})

test('SchemaError.customErrorMessage', ava => {
  setErrors({
    type: 'TypeError'
  })
  expect(getError(new SchemaTypeError('String', 1), {msg: true})).to.eql('TypeError')
})
