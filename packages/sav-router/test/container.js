import test from 'ava'
import {expect} from 'chai'

import {RouteContainer, connectRouter} from '../src/container.js'
import {Router} from '../src/router.js'
import {get} from '../src/decorators.js'
import {gen} from 'sav-decorator'

class TestRouter {
  constructor (opts) {
    this.opts = {...opts}
    this.providers = {}
  }
  provider (providers) {
    this.providers = {...this.providers, ...providers}
  }
  config (name) {
    return this.opts[name]
  }
}

test('container.api', ava => {
  let router = new TestRouter()
  let initModule = connectRouter(router)
  let container = router.container
  let module = {
    name: 'Test',
    options: {}
  }
  let action = {
    name: 'profile'
  }

  expect(container).to.be.an.instanceof(RouteContainer)
  expect(initModule).to.be.a('function')

  initModule(router, module)

  let providerModule = router.providers.route
  expect(providerModule).to.be.a('function')
  let context = {
    router,
    module,
    action,
    name: 'route',
    args: [['get'], ':test']
  }
  let middleware = providerModule(context)
  expect(middleware).to.be.a('function')

  let route = container.matchRoute('/Test/me', 'get')
  expect(route).to.be.a('object')

  expect(route).to.have.property('moduleName')
  expect(route).to.have.property('actionName')
  expect(route).to.have.property('path')
  expect(route).to.have.property('methods')
  expect(route).to.have.property('params')

  expect(container.matchRoute('Test/me', 'get')).to.equal(undefined)

  let route2 = container.matchRoute('TestX', 'get')
  expect(route2).to.equal(undefined)
})

test('container.path', ava => {
  let router = new Router()
  @gen
  class Test {
    @get path1 () {}
    @get(':path2') path2 () {}
    @get('/path3') path3 () {}
    @get('~path4') path4 () {}
  }
  router.declare(Test)

  let container = router.container
  expect(container.matchRoute('/Test/path1', 'get')).to.be.a('object')
  expect(container.matchRoute('/Test/path', 'get')).to.be.a('object')
  expect(container.matchRoute('/path3', 'get')).to.be.a('object')
  expect(container.matchRoute('/path4', 'get')).to.be.a('object')
})

test('container.prefix', ava => {
  let router = new Router({
    prefix: '/api/v3/'
  })
  @gen
  class Test {
    @get path1 () {}
    @get(':path2') path2 () {}
    @get('/path3') path3 () {}
    @get('~path4') path4 () {}
  }
  router.declare(Test)

  let container = router.container
  expect(container.matchRoute('/api/v3/Test/path1', 'get')).to.be.a('object')
  expect(container.matchRoute('/api/v3/Test/path', 'get')).to.be.a('object')
  expect(container.matchRoute('/path3', 'get')).to.be.a('object')
  expect(container.matchRoute('/api/v3/path4', 'get')).to.be.a('object')
})

test('container.case', ava => {
  let router = new Router({
    case: 'camel'
  })
  @gen
  class Test {
    @get path () {}
  }
  router.declare(Test)

  let container = router.container
  expect(container.matchRoute('/test/path', 'get')).to.be.a('object')
})
