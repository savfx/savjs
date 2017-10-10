import test from 'ava'
import {expect} from 'chai'

import {SchemaTypeError,
  SchemaEnumError,
  SchemaRequiredError,
  SchemaCheckedError,
  SchemaNoRuleError,
  setErrors
} from '../src/SchemaError.js'

test('SchemaError.api', ava => {
  expect(new SchemaTypeError('String', 1)).to.be.a('error')
  expect(new SchemaEnumError('Sex', 1)).to.be.a('error')
  expect(new SchemaRequiredError('sex')).to.be.a('error')
  expect(new SchemaCheckedError('sex', 'gt')).to.be.a('error')
  expect(new SchemaNoRuleError('sex')).to.be.a('error')
})

test('SchemaError.api', ava => {
  setErrors({
    type: 'typeError'
  })
  expect(new SchemaTypeError('String', 1).message).to.eql('typeError')
})
