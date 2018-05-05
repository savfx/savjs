import test from 'ava'
import {expect} from 'chai'
import { crc32 } from '../lib/crc32.js'

test('crc32', (t) => {
  expect(crc32('SheetJS')).to.eql(-1647298270)
  expect(crc32('Sh')).to.eql(-1826163454)
  expect(crc32('Sheet')).to.eql(1191034598)
  expect(crc32('foo bar baz٪☃🍣')).to.eql(1531648243)
  expect(crc32('this is a test\n')).to.eql(1912935186)
  t.pass()
})
