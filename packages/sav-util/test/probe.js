import test from 'ava'
import { probe, isObject } from '../src'

test('probe', (ava) => {
  ava.true(isObject(probe))

  // node 6
  ava.true(probe.Map)
  ava.true(probe.Proxy)

  // browser
  ava.false(probe.MessageChannel)
  ava.false(probe.localStorage)
  ava.false(probe.XMLHttpRequest)
  ava.false(probe.MutationObserver)
  ava.false(probe.window)
  ava.false(probe.document)
})
