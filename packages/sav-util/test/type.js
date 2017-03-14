import test from 'ava'
import expect from 'expect.js'
import * as type from '../src'

test('type', (ava) => {
  const items = {
    'Object': {},
    'Array': [],
    'Nan': NaN,
    'Undefined': undefined,
    'Boolean': true,
    'Number': 1.0,
    'String': '',
    'Function': function () {},
    'RegExp': /text/,
    'Date': new Date()
  }
  Object.keys(items).forEach((name) => {
        // items
    Object.keys(items).forEach((key) => {
      let ret = type['is' + name](items[key])
      expect(ret).to.eql(name === key)
    })
  })
})

test('isType', async (ava) => {
  expect(type.isPromise(Promise.resolve())).to.eql(true)
})
