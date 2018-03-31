import test from 'ava'
import {expect} from 'chai'
import {Router, stripPrefix} from '../src/Router.js'

test('api', async ava => {
  expect(stripPrefix).to.be.a('function')
  expect(Router).to.be.a('function')
  ava.pass()
})

test('stripPrefix', async ava => {
  expect(stripPrefix('', '')).to.eql('')
  expect(stripPrefix('/', '')).to.eql('/')
  expect(stripPrefix('/a', '/a')).to.eql('/')
  expect(stripPrefix('/a/', '/a')).to.eql('/')
  expect(stripPrefix('/a/b', '/a')).to.eql('/b')

  expect(stripPrefix('/a/', '/a/')).to.eql('/')
  expect(stripPrefix('/a/b', '/a/')).to.eql('/b')
  ava.pass()
})

test('router.basic', async (ava) => {
  let router = new Router({
    prefix: '',
    caseType: 'camel',
    method: 'GET',
    sensitive: true
  })
  router.load({
    modals: {
      Home: {
        routes: {
          default: {
          },
          relative: {
            path: 'relativeRoute'
          },
          absolute: {
            path: '/absoluteRoute'
          },
          user: {
            path: 'user/:id'
          }
        }
      },
      Article: {
        path: 'art',
        routes: {
          list: {},
          cat: {
            path: '/article/cat/:id'
          },
          item: {
            path: 'item/:id'
          }
        }
      }
    }
  })
  let pathEqual = (path, end) => {
    let ret = router.matchRoute(path, 'GET')
    expect(ret).to.be.a('object')
    expect(ret.route).to.be.a('object')
    if (typeof end === 'string') {
      expect(ret.route.path).to.eql(end)
    } else {
      expect(end ? (ret.route.path + '/') : ret.route.path).to.eql(path)
    }
  }

  pathEqual('/home/default')
  pathEqual('/home/default/', true)
  pathEqual('/home/relativeRoute')
  pathEqual('/home/relativeRoute/', true)
  pathEqual('/absoluteRoute')
  pathEqual('/absoluteRoute/', true)
  pathEqual('/home/user/1', '/home/user/:id')
  pathEqual('/home/user/1/', '/home/user/:id')

  expect(router.matchRoute('/Home/default', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/something', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/home', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/home/', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/home/anything', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/home/default', 'POST')).to.eql(undefined)

  pathEqual('/art/list')
  pathEqual('/art/list/', true)
  pathEqual('/art/item/1', '/art/item/:id')
  pathEqual('/art/item/1/', '/art/item/:id')
  pathEqual('/article/cat/1', '/article/cat/:id')
  pathEqual('/article/cat/1/', '/article/cat/:id')

  expect(Object.keys(router.getModals())).to.eql(['Home', 'Article'])
  ava.pass()
})

test('router.caseType.sensitive', async (ava) => {
  let router = new Router({caseType: 'hyphen', sensitive: false, method: 'GET'})
  router.load({
    modals: {
      UserProfile: {
        routes: {
          HomeInfo: {},
          UserAddress: {
            path: 'UserAddress'
          }
        }
      }
    }
  })
  expect(router.matchRoute('/user-profile/home-info', 'GET')).to.be.a('object')
  expect(router.matchRoute('/user-PROFILE/HOME-info/', 'GET')).to.be.a('object')
  expect(router.matchRoute('/user-profile/HomeInfo', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/UserProfile/home-info', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/UserProfile/HomeInfo', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/user-profile/UserAddress', 'GET')).to.be.a('object')
  ava.pass()
})

test('router.path', async (ava) => {
  let router = new Router()
  router.load({
    modals: {
      Home: {
        routes: {
          search: {
            path: 'search/:id'
          },
          regexp: {
            path: 'regexp/:id(\\d+)'
          },
          any: {
            path: 'any/:id/(.*)'
          }
        }
      }
    }
  })
  expect(router.matchRoute('/home/search/1', 'POST')).to.be.a('object')
  expect(router.matchRoute('/home/regexp/1', 'POST')).to.be.a('object')
  expect(router.matchRoute('/home/regexp/test', 'POST')).to.be.a('undefined')
  expect(router.matchRoute('/home/any/test', 'POST')).to.be.a('undefined')
  expect(router.matchRoute('/home/any/test/a', 'POST')).to.be.a('object')
  ava.pass()
})

test('router.prefix', async (ava) => {
  let prefixs = [
    '/admin',
    'admin',
    'admin/'
  ]

  prefixs.forEach(prefix => {
    let router = new Router({
      prefix,
      caseType: 'hyphen',
      sensitive: false,
      method: 'GET'
    })
    router.load({
      modals: {
        UserProfile: {
          routes: {
            HomeInfo: {},
            UserAddress: {
              path: 'UserAddress'
            }
          }
        }
      }
    })
    expect(router.matchRoute('/admin/user-profile/home-info', 'GET')).to.be.a('object')
    expect(router.matchRoute('/user-PROFILE/HOME-info/', 'GET')).to.eql(undefined)
    expect(router.matchRoute('/user-profile/HomeInfo', 'GET')).to.eql(undefined)
    expect(router.matchRoute('/UserProfile/home-info', 'GET')).to.eql(undefined)
    expect(router.matchRoute('/UserProfile/HomeInfo', 'GET')).to.eql(undefined)
    expect(router.matchRoute('/admin/user-profile/UserAddress', 'GET')).to.be.a('object')
  })
  ava.pass()
})

test('router.load', async (ava) => {
  let router = new Router({caseType: 'hyphen', sensitive: false, method: 'GET'})
  router.load({
    modals: [
      {
        id: 5,
        name: 'UserProfile',
        routes: [
          {
            name: 'UserAddress'
          }
        ]
      }
    ],
    actions: [
      {
        modal: 5,
        name: 'HomeInfo'
      }
    ]
  })
  expect(router.matchRoute('/user-profile/home-info', 'GET')).to.be.a('object')
  expect(router.matchRoute('/user-PROFILE/HOME-info/', 'GET')).to.be.a('object')
  expect(router.matchRoute('/user-profile/HomeInfo', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/UserProfile/home-info', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/UserProfile/HomeInfo', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/user-profile/user-address', 'NONE')).to.eql(undefined)
  expect(router.matchRoute('/user-profile/user-address', 'OPTIONS')).to.be.a('object')
  expect(router.matchRoute('/user-profile/user-address', 'GET')).to.be.a('object')
  ava.pass()
})
