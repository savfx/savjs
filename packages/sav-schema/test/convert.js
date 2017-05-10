import test from 'ava'
import {expect} from 'chai'

import {stringVal, boolVal, numberVal, arrayVal, objectVal} from '../src/defaultSchema.js'

test('defaultSchema.convert', ava => {
  expect(stringVal()).to.eql(undefined)
  expect(boolVal()).to.eql(undefined)
  expect(numberVal()).to.eql(undefined)
  expect(arrayVal()).to.eql(undefined)
  expect(objectVal()).to.eql(undefined)
})

test('defaultSchema.convert', ava => {
  expect(stringVal('')).to.eql('')
  expect(stringVal(1)).to.eql('1')
  expect(stringVal(true)).to.eql('true')
  expect(stringVal({})).to.eql({})

  expect(boolVal(true)).to.eql(true)
  expect(boolVal(false)).to.eql(false)
  expect(boolVal(1)).to.eql(true)
  expect(boolVal(-1)).to.eql(true)
  expect(boolVal(0)).to.eql(false)
  expect(boolVal('true')).to.eql(true)
  expect(boolVal('on')).to.eql(true)
  expect(boolVal('x')).to.eql(false)
  expect(boolVal({})).to.eql({})

  expect(numberVal(0)).to.eql(0)
  expect(numberVal(1)).to.eql(1)
  expect(numberVal('1')).to.eql(1)
  expect(numberVal(true)).to.eql(1)
  expect(numberVal(false)).to.eql(0)
  expect(numberVal('true')).to.eql(1)
  expect(numberVal('on')).to.eql(1)
  expect(numberVal('off')).to.eql(0)
  expect(numberVal('false')).to.eql(0)
  expect(numberVal('x')).to.eql(NaN)
  expect(numberVal({})).to.eql({})

  expect(arrayVal([])).to.eql([])
  expect(arrayVal('[]')).to.eql([])
  expect(arrayVal('1,2')).to.eql(['1', '2'])
  expect(arrayVal(1)).to.eql(1)

  expect(objectVal({})).to.eql({})
  expect(objectVal('{}')).to.eql({})
  expect(objectVal(1)).to.eql(1)
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
