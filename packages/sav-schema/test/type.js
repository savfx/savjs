import test from 'ava'
import {expect} from 'chai'

import {SchemaType} from '../lib/SchemaType.js'
import {isNumber} from 'sav-util'
import {Schema} from '../lib'

test('SchemaType', ava => {
  expect(SchemaType).to.be.a('function')
  let Age = new SchemaType({
    name: Number
  }, {
    export (obj) {
      expect(obj.name).to.eql('Number')
    }
  })
  expect(Age.create()).to.eql(0)
})

test('SchemaType.create', ava => {
  let schema = new Schema()
  expect(schema.String.create()).to.eql('')
  expect(schema.String.create('s')).to.eql('s')

  expect(schema.Number.create()).to.eql(0)
  expect(schema.Number.create(2.0)).to.eql(2.0)

  expect(schema.Boolean.create()).to.eql(false)
  expect(schema.Boolean.create(true)).to.eql(true)

  expect(schema.Array.create()).to.eql([])
  expect(schema.Array.create([1])).to.eql([1])

  expect(schema.Object.create()).to.eql({})
  expect(schema.Object.create({a: 1})).to.eql({a: 1})

  expect(schema.Int.create()).to.eql(0)
  expect(schema.Uint.create()).to.eql(0)
})

test('SchemaType.export', ava => {
  let Age = new SchemaType({
    name: Number,
    default: 1,
    check: isNumber,
    parse: Number
  }, {
    export (obj) {
      expect(obj.name).to.eql('Number')
    }
  })
  expect(Age.create()).to.eql(1)
  expect(Age.create(2)).to.eql(2)
  expect(Age.create('2')).to.eql(2)
  expect(Age.create('x')).to.eql(NaN)
  expect(Age.create(String)).to.eql(0)
  expect(Age.check).to.be.a('function')
  expect(Age.parse).to.be.a('function')
})
