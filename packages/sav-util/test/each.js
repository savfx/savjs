import test from 'ava'
import { each } from '../src'

test('each.Array', (t) => {
  t.plan(6)
  each([0, 1, 2], (val, key) => {
    t.true(val === key)
    t.pass()
  })
})

test('each.Argument', (t) => {
  t.plan(6)
  each((function () { return arguments })(0, 1, 2), (val, key) => {
    t.true(val === key)
    t.pass()
  })
})

test('each.Object', (t) => {
  t.plan(6)
  let obj = {
    0: 0,
    1: 1,
    2: 2
  }
  each(obj, (val, key) => {
    t.true(String(val) === key)
    t.pass()
  })
})
