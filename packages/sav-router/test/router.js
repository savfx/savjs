import test from 'ava'
import {expect} from 'chai'

import {Router} from '../src/router.js'
import {get, post, route} from '../src/decorators.js'
import {gen, conf} from 'sav-decorator'

test('router.use', ava => {
  let router = new Router()

  @gen
  class Test {
    @conf('hello', 'world')
    say () {}
  }

  router.use((router) => {
    router.on('module', (moudle, {ctx}) => {
      expect(ctx).to.equal(router)
    })
    router.on('action', (action, {ctx, module}) => {
      expect(module.actions[action.name]).to.equal(action)
    })
    router.on('middleware', ({name, args}, {ctx, module, action}) => {
      expect(name).to.be.a('string')
      expect(args).to.be.a('array')
    })
  })

  router.use({
    module (moudle, {ctx}) {
      expect(ctx).to.equal(router)
    }
  })

  router.declare(Test)
  router.declare([Test])
})

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
  expect(router.listenerCount('module')).to.eql(0)

  let router2 = new Router()
  expect(router2.listenerCount('module')).to.eql(1)
})
