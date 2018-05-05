import test from 'ava'
import { probe, isObject } from '../src'

test('probe', (t) => {
  t.true(isObject(probe))

  // node 6
  t.true(probe.Map)
  t.true(probe.Proxy)

  // browser
  t.false(probe.MessageChannel)
  t.false(probe.localStorage)
  t.false(probe.XMLHttpRequest)
  t.false(probe.MutationObserver)
  t.false(probe.window)
  t.false(probe.document)
})
