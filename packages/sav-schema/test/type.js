import test from 'ava'
import {expect} from 'chai'

import {SchemaType} from '../src/SchemaType.js'
import {isNumber} from 'sav-util'
import {Schema} from '../src/Schema.js'

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

// test('schema#type', ava => {
//   const {String, Number} = schema
//   const UserInfo = schema.declare({
//     props: {
//       name: String,
//       name1: 'String',
//       age: {
//         type: Number
//       },
//       age1: 'Number',
//       sex: 'Sex',
//       sex1: {
//         type: 'Sex',
//         optional: true
//       }
//     },
//     refs: {
//       Sex: {
//         enums: [
//           {key: 'male', value: 1},
//           {key: 'female', value: 2}
//         ]
//       }
//     }
//   })
//   assert.isObject(UserInfo)
//   assert.isNotObject(schema.Sex)
// })

// test('schema with raw type', ava => {
//   const struct = schema.declare({
//     props: {
//       name: String,
//       age: {
//         type: Number
//       }
//     }
//   })
//   assert.isObject(struct)
// })
