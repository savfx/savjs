import test from 'ava'
import {expect} from 'chai'

import {matchRoute, matchRouters} from '../src/matchs.js'

test('matchRoute:basic', ava => {
  let params = {}
  let path = 'hello/world'
  ava.true(matchRoute(path, params, path))
  ava.true(matchRoute(path, params, path))
  ava.false(matchRoute('hello/x', params, path))
})

test('matchRoute:id', ava => {
  let params = {}
  let route = 'hello/:id'
  ava.true(matchRoute(route, params, 'hello/world'))
  expect(params.id).to.be.equal('world')

  ava.true(matchRoute(route, params, 'hello/someone'))
  expect(params.id).to.be.equal('someone')

  expect(matchRoute(route, null, 'hello/someone')).to.equal(true)
  expect(matchRoute(route, null, 'hello/someone/something')).to.equal(false)

  let params2 = {}
  expect(matchRoute('hello/(\\w+)/(\\w+)', params2, 'hello/someone/something')).to.equal(true)
})

test('matchRouters', ava => {
  let ret
  expect(matchRouters([])).to.equal(undefined)

  let moduleRoute = {
    path: 'hello/:id',
    methods: ['get'],
    childs: []
  }
  ret = matchRouters([moduleRoute], 'hello/world', 'get')
  expect(ret).to.deep.equal(moduleRoute)

  ret = matchRouters([moduleRoute], 'hello/world', 'post')
  expect(ret).to.deep.equal(moduleRoute)

  let actionRoute = {
    path: 'hello/:id',
    methods: ['get']
  }
  ret = matchRouters([actionRoute], 'hello/world', 'get')
  expect(ret).to.deep.equal({
    path: 'hello/:id',
    methods: ['get'],
    params: {
      id: 'world'
    }
  })

  ret = matchRouters([actionRoute], 'hello/world', 'post')
  expect(ret).to.equal(undefined)
})
