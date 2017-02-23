import test from 'ava'
import {expect} from 'chai'
import {refer} from 'sav-decorator'

import {route, head, options, get, post, put, patch, del} from '../src/decorators.js'

test('decorators#api', ava => {
  class Test {
    @route(['get', 'post']) route () {}
    @head head () {}
    @options options () {}
    @get get () {}
    @post post () {}
    @put put () {}
    @patch patch () {}
    @del del () {}
  }
  expect(refer(Test)).to.deep.equal({
    route: [['route', ['get', 'post']]],
    head: [['route', ['head']]],
    options: [['route', ['options']]],
    get: [['route', ['get']]],
    post: [['route', ['post']]],
    put: [['route', ['put']]],
    patch: [['route', ['patch']]],
    del: [['route', ['delete']]]
  })
})

test('decorators', ava => {
  class Test {
    @get
    test () {}

    @del
    test2 () {}

    @post('a')
    test3 () {}

    @route('get', ':abc')
    test4 () {}
  }
  expect(refer(Test)).to.deep.equal({
    test: [['route', ['get']]],
    test2: [['route', ['delete']]],
    test3: [['route', ['post'], 'a']],
    test4: [['route', ['get'], ':abc']]
  })
})
