import test from 'ava'
import {expect} from 'chai'
import { md5 } from '../lib/md5.js'

test('md5', (t) => {
  expect(md5('')).to.eql('d41d8cd98f00b204e9800998ecf8427e')
  expect(md5('a')).to.eql('0cc175b9c0f1b6a831c399e269772661')
  expect(md5('z')).to.eql('fbade9e36a3f36d3d676c1b808451dd7')
  expect(md5('0')).to.eql('cfcd208495d565ef66e7dff9f98764da')
  expect(md5('9')).to.eql('45c48cce2e2d7fbdea1afc51c7c6ad26')
  expect(md5('Helo World')).to.eql('6f98776777acc2b6e3235736714bbaf7')
  expect(md5('你好')).to.eql('7eca689f0d3389d9dea66ae112e5cfd7')
  expect(md5('☺Ž')).to.eql('e0bfd52224648679872ca5f4319a628a')
  t.pass()
})
