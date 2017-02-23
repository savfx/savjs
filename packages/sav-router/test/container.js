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

  expect(container).to.be.an.instanceof(RouteContainer)

  initModule(router, {
    name: 'TestModule',
    options: {}
  })

  let providerModule = router.providers.route
  expect(providerModule).to.be.a('function')
})
