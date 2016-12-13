import test from 'ava'
import { bindEvent,isFunction, isObject } from '../'

test('bindEvent', (av) => {
  let testObj = {}
  bindEvent(textObj)
  const arr = ['on','off','once','listen','emit']
  arr.forEach((val)=>{
      av.true(isFunction(testObj[val]))
      av.pass()
  })
})


