import test from 'ava'
import {expect} from 'chai'
import {Schema} from '../src/Schema.js'
const schemas = require('./fixtures/schemas.js')

test('Schema.load', async ava => {
  let schema = new Schema()
  schema.load(schemas)
  expect(schema.Sex).to.be.a('object')
  expect(schema.NumberList).to.be.a('object')
  expect(schema.ObjectList).to.be.a('object')
  expect(schema.StructA).to.be.a('object')
  expect(schema.StructB).to.be.a('object')
  expect(schema.RefAccount).to.be.a('object')
  expect(schema.ReqAccount).to.be.a('object')
  expect(schema.ResAccount).to.be.a('object')
})
