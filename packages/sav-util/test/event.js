import test from 'ava'
import { bindEvent } from '../'
import {isFunction, isObject} from 'sav-util'

test('bindEvent', (av) => {
  let testObj = {}
  bindEvent(textObj)
  const arr = ['on','off','once','listen','emit']
  arr.forEach((val)=>{
      av.true(isFunction(testObj[val]))
      av.pass()
  })
})


