import test from 'ava'
import { bindEvent, isFunction } from '../src'

test('bindEvent', (t) => {
  let testObj = {}
  bindEvent(testObj)
  const arr = [
    'on',
    'before',
    'off',
    'once',
    'subscribe',
    'emit'
  ]
  arr.forEach((val) => {
    t.true(isFunction(testObj[val]))
  })
})
