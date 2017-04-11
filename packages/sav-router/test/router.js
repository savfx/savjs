import test from 'ava'
import {expect} from 'chai'

import {Router, get, post, route} from '../src'
import {gen, conf} from 'sav-decorator'

test('router.use', ava => {
  let router = new Router()

  @gen
  class Test {
    @conf('hello', 'world')
    say () {}
  }

  router.use((router) => {
    router.on('module', (moudle) => {
      expect(moudle.ctx).to.equal(router)
    })
    router.on('action', (action) => {
      expect(action.module.actions[action.actionName]).to.equal(action)
    })
  })

  router.use({
    module (moudle) {
      expect(moudle.ctx).to.equal(router)
    },
    async payload (ctx, next) {

    }
  })

  router.declare(Test)
})

test('router.api', async (ava) => {
  let router = new Router()
  @gen
  class Article {
    @get() async get () {}
    @post('/user/article/:aid') async post () {}
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
    @get() get () {}
    @post('/user/article/:aid') post () {}
  }
  @gen
  class User {
    @get() get () {}
    @post('') post () {}
    @route() route () {}
  }
  router.declare([Article, User])
})

test('router.opts', ava => {
  let router = new Router({noRoute: true})
  expect(router.listenerCount('module')).to.eql(0)

  let router2 = new Router()
  expect(router2.listenerCount('module')).to.eql(1)
})

test('router.warn', ava => {
  let router = new Router()
  expect(router.warn).to.be.a('function')
  let n = 1
  router.on('warn', (x) => {
    n += x
  })
  router.warn(2)
  expect(n).to.eql(3)
})

test('router.ctx.exec', async (ava) => {
  let router = new Router()
  @gen
  class Article {
    @get()
    hello (ctx, payload) {
      return 'hello'
    }
  }
  router.declare(Article)
  {
    let ctx = {
      path: '/Article/hello',
      method: 'GET'
    }
    await router.exec(ctx)
    expect(ctx.body).to.eql('hello')
  }
})
