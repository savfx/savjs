import test from 'ava'
import {expect} from 'chai'
import {toSchema} from '../lib/convert.js'
import {Schema} from '../lib'

test('api', ava => {
  expect(toSchema).to.be.a('function')
})

function testSchema (data) {
  let schemaData = toSchema(data)
  let schema = new Schema()
  let struct = schema.declare(schemaData)
  // console.log(JSON.stringify(schemaData, null, 2))
  struct.check(data)
}

test('toSchema.struct', ava => {
  let data = {
    s: 's',
    b: false,
    n: 1,
    sn: null,
    a: ['s'],
    an: [],
    ao: [{
      x: 1
    }],
    aa: [[1]],
    aax: [[[[]]]],
    struct: {
      n: 1,
      b: false
    }
  }
  testSchema(data)
})

test('toSchema.Mixed', ava => {
  let data = {
    s: 's',
    b: false,
    n: 1,
    as: ['s'],
    astruct: [{x: 1}],
    adstruct: [{x: [{b: false}]}],
    struct: {
      n: 1,
      b: false,
      m: {
        x: 1,
        v: [{
          x: {
            m: 'x',
            n: 'v',
            h: [{g: 1}],
            p: [1]
          },
          n: 1
        }]
      }
    }
  }
  testSchema(data)
})
