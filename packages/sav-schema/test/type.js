import test from 'ava'
import {expect} from 'chai'

import {SchemaType} from '../src/SchemaType.js'
import {Schema} from '../src/Schema.js'

test('SchemaType', ava => {
  expect(SchemaType).to.be.a('function')
  let Age = new SchemaType(null, {
    default: Number
  })
  expect(Age.create()).to.eql(0)
  let Age2 = new SchemaType(null, {
    default: 1
  })
  expect(Age2.create()).to.eql(1)
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

  expect(schema.Long.create()).to.eql(0)
  expect(schema.Integer.create()).to.eql(0)
  expect(schema.Short.create()).to.eql(0)
  expect(schema.Byte.create()).to.eql(0)

  expect(schema.UInt8.create()).to.eql(0)
  expect(schema.UInt16.create()).to.eql(0)
  expect(schema.UInt32.create()).to.eql(0)

  expect(schema.Int8.create()).to.eql(0)
  expect(schema.Int16.create()).to.eql(0)
  expect(schema.Int32.create()).to.eql(0)

  schema.Int32.check(0)
})

test('SchemaType.parse', ava => {
  let schema = new Schema()
  expect(schema.String.parse()).to.eql(undefined)
  expect(schema.String.parse(1)).to.eql('1')
  expect(schema.String.parse('2')).to.eql('2')

  expect(schema.Number.parse()).to.eql(undefined)
  expect(schema.Number.parse(2.0)).to.eql(2.0)
  expect(schema.Number.parse('2.0')).to.eql(2.0)
  expect(schema.Number.parse('true')).to.eql(1)
  expect(schema.Number.parse('on')).to.eql(1)
  expect(schema.Number.parse('false')).to.eql(0)
  expect(schema.Number.parse('x')).to.eql(0)
  expect(schema.Number.parse(false)).to.eql(0)
  expect(schema.Number.parse(true)).to.eql(1)

  expect(schema.Boolean.parse()).to.eql(undefined)
  expect(schema.Boolean.parse(true)).to.eql(true)
  expect(schema.Boolean.parse('true')).to.eql(true)
  expect(schema.Boolean.parse('on')).to.eql(true)
  expect(schema.Boolean.parse('false')).to.eql(false)
  expect(schema.Boolean.parse('x')).to.eql(false)
  expect(schema.Boolean.parse(0.0)).to.eql(false)
  expect(schema.Boolean.parse(1.0)).to.eql(true)

  expect(schema.Array.parse()).to.eql(undefined)
  expect(schema.Array.parse([1])).to.eql([1])
  expect(schema.Array.parse('1,2')).to.eql(['1', '2'])
  expect(schema.Array.parse('[1,2]')).to.eql([1, 2])
  expect(schema.Array.parse('[a, b]')).to.eql('[a, b]')

  expect(schema.Object.parse()).to.eql(undefined)
  expect(schema.Object.parse({a: 1})).to.eql({a: 1})
  expect(schema.Object.parse('{"a": 1}')).to.eql({a: 1})
  expect(schema.Object.parse('{"a": b}')).to.eql('{"a": b}')
})

test('SchemaType.ObjectID', ava => {
  let schema = new Schema()
  let m = schema.declare({
    props: {
      id: String
    }
  })
  class ObjectID {
    constructor (id) {
      this.id = id
    }
    toString () {
      return this.id
    }
  }
  let data = {
    id: new ObjectID('sss')
  }
  m.check(data)
})
