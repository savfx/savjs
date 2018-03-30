import test from 'ava'
import {expect} from 'chai'
import {loadInterface } from '../../src/loaders/interface.js'
import path from 'path'

test('convertInterface', async (ava) => {
  expect(loadInterface).to.be.a('function')
  let modules = await loadInterface(path.resolve(__dirname, '../fixtures/interface'))
  expect(modules).to.be.a('object')
  ava.pass()
})
