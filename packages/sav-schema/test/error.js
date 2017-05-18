import test from 'ava'
import {expect} from 'chai'

import {SchemaTypeError, SchemaEnumError, SchemaRequiredError} from '../src/SchemaError.js'

test('SchemaError.api', ava => {
  expect(new SchemaTypeError('String', 1)).to.be.a('error')
  expect(new SchemaEnumError('Sex', 1)).to.be.a('error')
  expect(new SchemaRequiredError('sex')).to.be.a('error')
})
