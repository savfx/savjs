import test from 'ava'
import {expect} from 'chai'

import {Router} from '../src/router.js'
import {get, post, route} from '../src/decorators.js'
import {gen, quickConf} from 'sav-decorator'

test('router.api', async (ava) => {
  let router = new Router()
  @gen
  class Article {
    @get async get () {}
    @post('/user/article/:aid') post () {}
  }
  router.declare(Article)
  let route = router.route()
  await route({
    path: '/Article/get',
    method: 'GET'
  }, async () => {
    throw new Error('hehe')
  })
  await route({
    path: '/article/post',
    method: 'GET'
  }, async () => {
    ava.pass()
  })
})

test('router.declare#2', ava => {
  let router = new Router()
  @gen
  class Article {
    @get get () {}
    @post('/user/article/:aid') post () {}
  }
  @gen
  class User {
    @get get () {}
    @post('') post () {}
    @route route () {}
  }
  router.declare([Article, User])
})

test('router.opts', ava => {
  let router = new Router({noRoute: true})
  expect(router.plugins).to.eql([])

  let router2 = new Router()
  expect(router2.plugins).to.have.lengthOf(1)
})

test('router.provider.empty', ava => {
  let router = new Router()
  router.provider({
    request () {
    }
  })
  let request = quickConf('request')
  let readonly = quickConf('readonly')
  @gen
  class Test {
    @request @readonly req () {}
  }
  router.declare(Test)
  expect(Test.actions.req.middlewares).to.eql([])
})
