import test from 'ava'
import {expect} from 'chai'
import {encode, decode} from '../lib/rc4.js'

test('rc4', (t) => {
  [
    '',
    'a',
    'z',
    '0',
    '9',
    'Hello World',
    '你好',
    '☺Ž'
  ].forEach((val) => {
    expect(decode(encode(val, val), val)).to.eql(val)
    expect(decode(encode(val, 'key'), 'key')).to.eql(val)
  })
  t.pass()
})
