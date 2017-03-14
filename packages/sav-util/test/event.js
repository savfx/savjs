import test from 'ava'
import { bindEvent, isFunction } from '../src'

test('bindEvent', (av) => {
  let testObj = {}
  bindEvent(testObj)
  const arr = ['on', 'off', 'once', 'subscribe', 'emit']
  arr.forEach((val) => {
    av.true(isFunction(testObj[val]))
  })
})
