import test from 'ava'
import {expect} from 'chai'
import {compose} from '../src/compose.js'

function wait (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms || 1))
}

test('compose should work', async t => {
  let arr = []
  let stack = []
  stack.push(async (context, next) => {
    arr.push(1)
    await wait(1)
    await next()
    await wait(1)
    arr.push(6)
  })
  stack.push(async (context, next) => {
    arr.push(2)
    await wait(1)
    await next()
    await wait(1)
    arr.push(5)
  })
  stack.push(async (context, next) => {
    arr.push(3)
    await wait(1)
    await next()
    await wait(1)
    arr.push(4)
  })
  await compose(stack)({})
  expect(arr).to.eql([1, 2, 3, 4, 5, 6])

  t.pass()
})

test('compse should be able to be called twice', async t => {
  let stack = []
  stack.push(async (context, next) => {
    context.arr.push(1)
    await wait(1)
    await next()
    await wait(1)
    context.arr.push(6)
  })
  stack.push(async (context, next) => {
    context.arr.push(2)
    await wait(1)
    await next()
    await wait(1)
    context.arr.push(5)
  })
  stack.push(async (context, next) => {
    context.arr.push(3)
    await wait(1)
    await next()
    await wait(1)
    context.arr.push(4)
  })
  const fn = compose(stack)
  const ctx1 = { arr: [] }
  const ctx2 = { arr: [] }
  const out = [1, 2, 3, 4, 5, 6]
  await fn(ctx1).then(() => {
    expect(out).to.eql(ctx1.arr)
    return fn(ctx2)
  }).then(() => {
    expect(out).to.eql(ctx2.arr)
  })

  t.pass()
})

test('compose should throw', async t => {
  let err
  try {
    compose([{}])
  } catch (e) {
    err = e
  }
  expect(err).to.not.be.a('undefined')
  t.pass()
})
