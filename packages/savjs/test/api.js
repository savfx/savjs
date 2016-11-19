import test from 'ava'
import savjs from '../'
import { isObject } from 'sav-util'

test('savjs#api', (ava) => {
  ava.true(isObject(savjs))
})
