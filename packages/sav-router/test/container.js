import test from 'ava'
import {expect} from 'chai'

import {RouteContainer, connectRouter, CONTAINER_KEY} from '../src/container.js'

class Router {
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
  let router = new Router()
  let initModule = connectRouter(router)
  let container = router[CONTAINER_KEY]
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

  let route = container.matchRoute('Test/me', 'get')
  expect(route).to.be.a('object')

  expect(route).to.have.property('moduleName')
  expect(route).to.have.property('actionName')
  expect(route).to.have.property('path')
  expect(route).to.have.property('methods')
  expect(route).to.have.property('params')

  let route2 = container.matchRoute('TestX', 'get')
  expect(route2).to.equal(undefined)
})
