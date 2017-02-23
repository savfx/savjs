import test from 'ava'
import {isFunction} from 'sav-util'

import {Router, route, head, options, get, post, put, patch, del} from '../src/index'

test('api', (ava) => {
  ava.true(isFunction(Router))
  ava.true(isFunction(route))
  ava.true(isFunction(head))
  ava.true(isFunction(options))
  ava.true(isFunction(get))
  ava.true(isFunction(post))
  ava.true(isFunction(put))
  ava.true(isFunction(patch))
  ava.true(isFunction(del))
})
