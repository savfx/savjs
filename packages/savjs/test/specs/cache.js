import test from 'ava'
import {expect} from 'chai'

import {Cache} from '../../src/Cache.js'

test('Cache', (ava) => {
  expect(Cache).to.be.a('function')
  let cache = new Cache()
  expect(cache.get('a')).to.eql(undefined)
  cache.set('a', 1, 'b', 'x')
  expect(cache.count).to.eql(1)
  cache.set('a', 1, 'b', 'c')
  expect(cache.count).to.eql(1)
  expect(cache.get('a')).to.eql('c')
  cache.set('a', 0, 'b', 'c')
  expect(cache.get('a')).to.eql(undefined)

  cache.set('a', 0, 'b', 'c')
  cache.removeByName('a')
  expect(cache.count).to.eql(1)
  cache.removeByName('b')
  expect(cache.count).to.eql(0)

  cache.set('x')
  cache.set('y')
  expect(cache.count).to.eql(2)
  cache.clear()
  expect(cache.count).to.eql(0)
  ava.pass()
})
